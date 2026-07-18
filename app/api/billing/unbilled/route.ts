import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession } from "@/utils/auth";

const getInvestigationPrice = (name: string) => {
  const prices: Record<string, number> = {
    "X-Ray Knee AP/Lat": 400,
    "X-Ray Cervical Spine": 450,
    "X-Ray Lumbar Spine": 450,
    "X-Ray Pelvis": 400,
    "MRI Knee Joint": 3500,
    "MRI Cervical Spine": 4000,
    "MRI Lumbar Spine": 4000,
    "MRI Shoulder": 3500,
    "CT Scan Joints": 2500,
    "DEXA Bone Density Scan": 1500,
    "Rheumatoid Factor (RF)": 600,
    "Serum Uric Acid": 200,
    "Serum Calcium": 250,
    "Vitamin D3 (25-OH)": 1200,
    "CRP (C-Reactive Protein)": 400,
    "ESR": 150,
  };
  return prices[name] || 500;
};

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [patients, consultations, bills, investigations, pharmacy, otProcedures] = await Promise.all([
      prisma.patient.findMany(),
      prisma.consultation.findMany({ include: { patient: true } }),
      prisma.bill.findMany({ select: { opNumber: true, items: true } }),
      prisma.investigationTransaction.findMany({ where: { status: { in: ["Completed", "COMPLETED"] } } }),
      prisma.pharmacyDispense.findMany(),
      prisma.oTProcedure.findMany({ where: { status: { in: ["Completed", "COMPLETED"] } } })
    ]);

    // Map OP Number (uppercase) to a Map of { serviceName: count }
    const billedCountsMap = new Map<string, Map<string, number>>();
    bills.forEach(b => {
      const bOp = b.opNumber.trim().toUpperCase();
      if (!billedCountsMap.has(bOp)) {
        billedCountsMap.set(bOp, new Map());
      }
      try {
        const items = JSON.parse(b.items);
        const opMap = billedCountsMap.get(bOp)!;
        items.forEach((item: any) => {
          if (item.serviceName) {
            const svc = item.serviceName.trim();
            opMap.set(svc, (opMap.get(svc) || 0) + 1);
          }
        });
      } catch (e) {
        // ignore parse error
      }
    });

    const unbilledMap = new Map<string, any>();

    const getOrInitPatient = (opNumber: string, patientName: string, patientId: string, department: string, complaint: string, activityDate?: Date) => {
      const normalizedOp = opNumber.trim().toUpperCase();
      if (!unbilledMap.has(normalizedOp)) {
        unbilledMap.set(normalizedOp, {
          patientName,
          opNumber: normalizedOp,
          patientId,
          department: department || "General",
          complaint: complaint || "N/A",
          latestActivityDate: activityDate || new Date(0),
          items: []
        });
      } else {
        const existing = unbilledMap.get(normalizedOp);
        if (activityDate && new Date(activityDate) > new Date(existing.latestActivityDate)) {
          existing.latestActivityDate = activityDate;
        }
      }
      return unbilledMap.get(normalizedOp);
    };

    // Helper to check if an item is billed (and decrement its count if so)
    const isBilled = (opNumber: string, serviceName: string) => {
      const normalizedOp = opNumber.trim().toUpperCase();
      const svc = serviceName.trim();
      const opMap = billedCountsMap.get(normalizedOp);
      if (!opMap) return false;
      const count = opMap.get(svc) || 0;
      if (count > 0) {
        opMap.set(svc, count - 1);
        return true;
      }
      return false;
    };

    // 1. Process all patients for Registration Fee if never billed
    for (const p of patients) {
      if (!isBilled(p.opNumber, "Registration Fee")) {
        const entry = getOrInitPatient(p.opNumber, p.fullName, p.patientId, p.department, p.complaint, (p as any).createdAt);
        entry.items.push({
          serviceName: "Registration Fee",
          category: "Registration",
          amount: 100,
        });
      }
    }

    // 2. Process consultations for Consultation Fee
    for (const c of consultations) {
      if (c.status === "Completed" || c.status === "COMPLETED" || c.status === "Waiting") { // Include Waiting to pull pending fees
        // 10-day follow up logic
        const patientConsultations = consultations
          .filter(pc => pc.patientId === c.patientId && new Date(pc.consultationDate) <= new Date(c.consultationDate))
          .sort((a, b) => new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime());
          
        let shouldCharge = true;
        if (patientConsultations.length > 1) {
          const firstDate = new Date(patientConsultations[0].consultationDate).getTime();
          const currDate = new Date(c.consultationDate).getTime();
          
          let lastChargedDate = firstDate;
          for (const pc of patientConsultations) {
            const d = new Date(pc.consultationDate).getTime();
            if ((d - lastChargedDate) / (1000 * 3600 * 24) > 10) {
              lastChargedDate = d;
            }
          }
          
          if (lastChargedDate !== currDate) {
            shouldCharge = false;
          }
        }

        const serviceName = shouldCharge ? `Consultation Fee (${c.department || "General"})` : `Follow-up Consultation (${c.department || "General"})`;
        
        if (!isBilled(c.opNumber, serviceName) && !isBilled(c.opNumber, `Consultation Fee (${c.department || "General"})`)) {
           const entry = getOrInitPatient(c.opNumber, c.patient?.fullName || "Unknown", c.patientId, c.department, c.patient?.complaint || "", c.consultationDate);
           entry.items.push({
             serviceName: serviceName,
             category: "Consultation",
             amount: shouldCharge ? 500 : 0,
           });
        }
      }
    }

    // 3. Process completed investigations
    for (const tx of investigations) {
      if (!isBilled(tx.opNumber, tx.testName)) {
        const p = patients.find(pat => pat.opNumber.trim().toUpperCase() === tx.opNumber.trim().toUpperCase());
        const entry = getOrInitPatient(tx.opNumber, p?.fullName || "Unknown", tx.patientId, p?.department || "General", p?.complaint || "", tx.orderedDate);
        entry.items.push({
          serviceName: tx.testName.trim(),
          category: "Investigation",
          amount: tx.amount,
        });
      }
    }

    // 4. Process pharmacy dispenses
    for (const ph of pharmacy) {
      const serviceName = `${ph.medicineName.trim()} (Pharmacy)`;
      if (!isBilled(ph.opNumber, serviceName)) {
        const p = patients.find(pat => pat.opNumber.trim().toUpperCase() === ph.opNumber.trim().toUpperCase());
        const entry = getOrInitPatient(ph.opNumber, p?.fullName || "Unknown", ph.patientId, p?.department || "General", p?.complaint || "", ph.dispensedDate);
        
        entry.items.push({
          serviceName: serviceName,
          category: "Pharmacy",
          amount: ph.amount,
        });
      }
    }

    // 5. Process OT Procedures
    for (const ot of otProcedures) {
      const serviceName = `${ot.procedureName.trim()} (OT)`;
      if (!isBilled(ot.opNumber, serviceName)) {
        const p = patients.find(pat => pat.opNumber.trim().toUpperCase() === ot.opNumber.trim().toUpperCase());
        const entry = getOrInitPatient(ot.opNumber, p?.fullName || "Unknown", ot.patientId, p?.department || "General", p?.complaint || "", ot.createdAt);
        entry.items.push({
          serviceName: serviceName,
          category: "OT Procedure",
          amount: ot.cost,
        });
      }
    }

    // Convert map to array and calculate total, filtering out those with 0 items
    const unbilled = Array.from(unbilledMap.values())
      .filter(entry => entry.items.length > 0)
      .map((entry) => ({
        ...entry,
        total: entry.items.reduce((acc: number, it: any) => acc + (it.amount || 0), 0),
      }))
      .sort((a, b) => new Date(b.latestActivityDate).getTime() - new Date(a.latestActivityDate).getTime());

    return NextResponse.json(unbilled);
  } catch (error: any) {
    console.error("Get Unbilled Patients Error:", error);
    return NextResponse.json({ message: "Failed to fetch unbilled patients", error: error.message }, { status: 500 });
  }
}
