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
      prisma.investigationTransaction.findMany({ where: { status: "Completed" } }),
      prisma.pharmacyDispense.findMany(),
      prisma.oTProcedure.findMany({ where: { status: "Completed" } })
    ]);

    // Map OP Number to a Map of { serviceName: count }
    const billedCountsMap = new Map<string, Map<string, number>>();
    bills.forEach(b => {
      if (!billedCountsMap.has(b.opNumber)) {
        billedCountsMap.set(b.opNumber, new Map());
      }
      try {
        const items = JSON.parse(b.items);
        const opMap = billedCountsMap.get(b.opNumber)!;
        items.forEach((item: any) => {
          if (item.serviceName) {
            opMap.set(item.serviceName, (opMap.get(item.serviceName) || 0) + 1);
          }
        });
      } catch (e) {
        // ignore parse error
      }
    });

    const unbilledMap = new Map<string, any>();

    const getOrInitPatient = (opNumber: string, patientName: string, patientId: string, department: string, complaint: string) => {
      if (!unbilledMap.has(opNumber)) {
        unbilledMap.set(opNumber, {
          patientName,
          opNumber,
          patientId,
          department: department || "General",
          complaint: complaint || "N/A",
          items: []
        });
      }
      return unbilledMap.get(opNumber);
    };

    // Helper to check if an item is billed (and decrement its count if so)
    const isBilled = (opNumber: string, serviceName: string) => {
      const opMap = billedCountsMap.get(opNumber);
      if (!opMap) return false;
      const count = opMap.get(serviceName) || 0;
      if (count > 0) {
        opMap.set(serviceName, count - 1);
        return true;
      }
      return false;
    };

    // 1. Process all patients for Registration Fee if never billed
    for (const p of patients) {
      if (!isBilled(p.opNumber, "Registration Fee")) {
        const entry = getOrInitPatient(p.opNumber, p.fullName, p.patientId, p.department, p.complaint);
        entry.items.push({
          serviceName: "Registration Fee",
          category: "Registration",
          amount: 200,
        });
      }
    }

    // 2. Process consultations for Consultation Fee
    for (const c of consultations) {
      if (c.status === "Completed") {
        const serviceName = `Consultation Fee (${c.department || "General"})`;
        if (!isBilled(c.opNumber, serviceName)) {
           const entry = getOrInitPatient(c.opNumber, c.patient?.fullName || "Unknown", c.patientId, c.department, c.patient?.complaint || "");
           entry.items.push({
             serviceName: serviceName,
             category: "Consultation",
             amount: 500,
           });
        }
      }
    }

    // 3. Process completed investigations
    for (const tx of investigations) {
      if (!isBilled(tx.opNumber, tx.testName)) {
        const p = patients.find(pat => pat.opNumber === tx.opNumber);
        const entry = getOrInitPatient(tx.opNumber, p?.fullName || "Unknown", tx.patientId, p?.department || "General", p?.complaint || "");
        entry.items.push({
          serviceName: tx.testName,
          category: "Investigation",
          amount: tx.amount,
        });
      }
    }

    // 4. Process pharmacy dispenses
    for (const ph of pharmacy) {
      const serviceName = `${ph.medicineName} (Pharmacy)`;
      if (!isBilled(ph.opNumber, serviceName)) {
        const p = patients.find(pat => pat.opNumber === ph.opNumber);
        const entry = getOrInitPatient(ph.opNumber, p?.fullName || "Unknown", ph.patientId, p?.department || "General", p?.complaint || "");
        
        // Since we decrement counts per item, we should add each individual dispense as a separate item, or aggregate correctly.
        // It's safer to aggregate them in the unbilled list to avoid too many duplicate items.
        const existingItem = entry.items.find((i: any) => i.serviceName === serviceName);
        if (existingItem) {
           existingItem.amount += ph.amount;
        } else {
           entry.items.push({
             serviceName: serviceName,
             category: "Pharmacy",
             amount: ph.amount,
           });
        }
      }
    }

    // 5. Process OT Procedures
    for (const ot of otProcedures) {
      const serviceName = `${ot.procedureName} (OT)`;
      if (!isBilled(ot.opNumber, serviceName)) {
        const p = patients.find(pat => pat.opNumber === ot.opNumber);
        const entry = getOrInitPatient(ot.opNumber, p?.fullName || "Unknown", ot.patientId, p?.department || "General", p?.complaint || "");
        entry.items.push({
          serviceName: serviceName,
          category: "OT Procedure",
          amount: ot.cost,
        });
      }
    }

    // Convert map to array and calculate total, filtering out those with 0 items
    const unbilled = Array.from(unbilledMap.values()).filter(entry => entry.items.length > 0).map((entry) => {
      return {
        ...entry,
        total: entry.items.reduce((acc: number, it: any) => acc + (it.amount || 0), 0),
      };
    });

    return NextResponse.json(unbilled);
  } catch (error: any) {
    console.error("Get Unbilled Patients Error:", error);
    return NextResponse.json({ message: "Failed to fetch unbilled patients", error: error.message }, { status: 500 });
  }
}
