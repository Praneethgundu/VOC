import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    // Validate structure
    if (!data || typeof data !== "object") {
      return NextResponse.json({ message: "Invalid backup data format" }, { status: 400 });
    }

    // Run delete and inserts inside a single database transaction to guarantee atomic consistency
    await prisma.$transaction(async (tx) => {
      // 1. Clear existing tables (order matters to prevent foreign key constraint violations)
      await tx.auditLog.deleteMany();
      await tx.oTProcedure.deleteMany();
      await tx.bill.deleteMany();
      await tx.pharmacyDispense.deleteMany();
      await tx.inventoryItem.deleteMany();
      await tx.investigationTransaction.deleteMany();
      await tx.investigationMaster.deleteMany();
      await tx.consultation.deleteMany();
      await tx.patient.deleteMany();
      await tx.user.deleteMany();

      // Helper to insert array if exists
      const insertMany = async (tableName: string, list: any[]) => {
        if (!Array.isArray(list)) return;
        
        // SQLite has max variable limits, so we write records sequentially or in small chunks
        for (const item of list) {
          // Parse date fields appropriately
          const dataObj = { ...item };
          const dateFields = ["createdAt", "updatedAt", "consultationDate", "orderedDate", "dispensedDate", "date", "timestamp"];
          dateFields.forEach((field) => {
            if (dataObj[field]) dataObj[field] = new Date(dataObj[field]);
          });

          // Table mapping
          if (tableName === "Users") await tx.user.create({ data: dataObj });
          else if (tableName === "Patients") await tx.patient.create({ data: dataObj });
          else if (tableName === "Consultations") await tx.consultation.create({ data: dataObj });
          else if (tableName === "Investigation_Master") await tx.investigationMaster.create({ data: dataObj });
          else if (tableName === "Investigation_Transactions") await tx.investigationTransaction.create({ data: dataObj });
          else if (tableName === "Inventory") await tx.inventoryItem.create({ data: dataObj });
          else if (tableName === "Pharmacy") await tx.pharmacyDispense.create({ data: dataObj });
          else if (tableName === "Bills") await tx.bill.create({ data: dataObj });
          else if (tableName === "OT_Procedures") await tx.oTProcedure.create({ data: dataObj });
          else if (tableName === "Audit_Log") await tx.auditLog.create({ data: dataObj });
        }
      };

      await insertMany("Users", data.Users);
      await insertMany("Patients", data.Patients);
      await insertMany("Consultations", data.Consultations);
      await insertMany("Investigation_Master", data.Investigation_Master);
      await insertMany("Investigation_Transactions", data.Investigation_Transactions);
      await insertMany("Inventory", data.Inventory);
      await insertMany("Pharmacy", data.Pharmacy);
      await insertMany("Bills", data.Bills);
      await insertMany("OT_Procedures", data.OT_Procedures);
      await insertMany("Audit_Log", data.Audit_Log);
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "SYSTEM",
        action: "RESTORE_DATABASE",
        recordId: "SYSTEM_RESTORE",
      },
    });

    return NextResponse.json({ message: "Database restored successfully" });
  } catch (error: any) {
    console.error("Database Restore Error:", error);
    return NextResponse.json({ message: "Failed to restore database", error: error.message }, { status: 500 });
  }
}
