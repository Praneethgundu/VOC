import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [patients, consultations, bills] = await Promise.all([
      prisma.patient.findMany(),
      prisma.consultation.findMany({
        include: { patient: true },
      }),
      prisma.bill.findMany({ select: { opNumber: true } }),
    ]);

    const billedOps = new Set(bills.map((b) => b.opNumber));
    const unbilledMap = new Map<string, any>();

    // 1. Process all patients for Registration Fee if never billed
    for (const p of patients) {
      if (!billedOps.has(p.opNumber)) {
        unbilledMap.set(p.opNumber, {
          patientName: p.fullName,
          opNumber: p.opNumber,
          patientId: p.patientId,
          department: p.department || "Orthopaedics",
          complaint: p.complaint || "N/A",
          items: [
            {
              serviceName: "Registration Fee",
              category: "Registration",
              amount: 200,
            },
          ],
        });
      }
    }

    // 2. Process consultations for completed ones if never billed
    for (const c of consultations) {
      if (c.status === "Completed" && !billedOps.has(c.opNumber)) {
        let existing = unbilledMap.get(c.opNumber);
        if (!existing) {
          existing = {
            patientName: c.patient ? c.patient.fullName : "Unknown Patient",
            opNumber: c.opNumber,
            patientId: c.patientId,
            department: c.department || "Orthopaedics",
            complaint: c.patient ? c.patient.complaint : "N/A",
            items: [],
          };
          unbilledMap.set(c.opNumber, existing);
        }

        existing.items.push({
          serviceName: `Consultation Fee (${c.department || "General"})`,
          category: "Consultation",
          amount: 500,
        });

        // Add investigations ordered in this consultation
        if (c.prescription) {
          try {
            // Check if prescription contains ordered investigations
            // Let's also verify if there are pending investigations in the transaction table
            const transactions = await prisma.investigationTransaction.findMany({
              where: { opNumber: c.opNumber, status: "Completed" },
            });
            transactions.forEach((tx) => {
              existing.items.push({
                serviceName: tx.testName,
                category: "Investigation",
                amount: tx.amount,
              });
            });
          } catch (e) {
            console.error("Error fetching patient investigations for unbilled", e);
          }
        }
      }
    }

    // Convert map to array and calculate total
    const unbilled = Array.from(unbilledMap.values()).map((entry) => {
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
