import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [
      users,
      patients,
      consultations,
      investigationMaster,
      investigationTransaction,
      inventoryItem,
      pharmacyDispense,
      bill,
      otProcedure,
      auditLog,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.patient.findMany(),
      prisma.consultation.findMany(),
      prisma.investigationMaster.findMany(),
      prisma.investigationTransaction.findMany(),
      prisma.inventoryItem.findMany(),
      prisma.pharmacyDispense.findMany(),
      prisma.bill.findMany(),
      prisma.oTProcedure.findMany(),
      prisma.auditLog.findMany(),
    ]);

    return NextResponse.json({
      Users: users,
      Patients: patients,
      Consultations: consultations,
      Investigation_Master: investigationMaster,
      Investigation_Transactions: investigationTransaction,
      Inventory: inventoryItem,
      Pharmacy: pharmacyDispense,
      Bills: bill,
      OT_Procedures: otProcedure,
      Audit_Log: auditLog,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to generate backup", error: error.message }, { status: 500 });
  }
}
