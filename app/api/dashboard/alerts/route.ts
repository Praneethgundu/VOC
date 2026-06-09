import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const alerts = [];

    // 1. Pharmacy Low Stock (< 50)
    const lowStockMeds = await prisma.inventoryItem.findMany({
      where: {
        stock: { lt: 50 },
      },
    });

    if (lowStockMeds.length > 0) {
      alerts.push({
        id: "pharmacy_low_stock",
        type: "warning",
        module: "Pharmacy",
        title: "Low Stock Alert",
        message: `${lowStockMeds.length} medicine(s) are running low on stock (< 50 units).`,
        actionPath: "/pharmacy",
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Waiting Patients (Registered Patients who haven't completed consultation)
    const waitingPatients = await prisma.patient.findMany({
      where: {
        status: "Registered",
      },
    });

    if (waitingPatients.length > 0) {
      alerts.push({
        id: "consultation_waiting",
        type: "info",
        module: "Consultation",
        title: "Patients Waiting",
        message: `${waitingPatients.length} patient(s) waiting for consultation.`,
        actionPath: "/consultation",
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Pending Investigations (status !== Completed)
    const pendingTests = await prisma.investigationTransaction.findMany({
      where: {
        NOT: {
          status: "Completed",
        },
      },
    });

    if (pendingTests.length > 0) {
      alerts.push({
        id: "investigation_pending",
        type: "info",
        module: "Investigations",
        title: "Pending Lab Tests",
        message: `${pendingTests.length} ordered investigation(s) pending.`,
        actionPath: "/investigations",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to generate alerts", error: error.message }, { status: 500 });
  }
}
