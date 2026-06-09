import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["PHARMACIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { opNumber, medicineId, quantity, amount } = body;

    if (!opNumber || !medicineId || !quantity) {
      return NextResponse.json({ message: "OP Number, Medicine ID, and Quantity are required" }, { status: 400 });
    }

    // 1. Verify Patient
    const patient = await prisma.patient.findUnique({
      where: { opNumber: String(opNumber).trim() },
    });
    if (!patient) {
      return NextResponse.json({ message: "Invalid Patient OP Number" }, { status: 404 });
    }

    // 2. Verify Medicine
    const medicine = await prisma.inventoryItem.findUnique({
      where: { medicineId },
    });
    if (!medicine) {
      return NextResponse.json({ message: "Medicine not found in inventory" }, { status: 404 });
    }

    const dispenseQty = Number(quantity);
    if (medicine.stock < dispenseQty) {
      return NextResponse.json({ message: `Insufficient stock. Available: ${medicine.stock}` }, { status: 400 });
    }

    // 3. Update Inventory & Log Dispense atomically using Prisma transactions
    const result = await prisma.$transaction(async (tx) => {
      const updatedMed = await tx.inventoryItem.update({
        where: { medicineId },
        data: {
          stock: {
            decrement: dispenseQty,
          },
        },
      });

      const dispenseId = "DSP-" + require("crypto").randomBytes(4).toString("hex").toUpperCase();
      const dispenseRecord = await tx.pharmacyDispense.create({
        data: {
          id: dispenseId,
          patientId: patient.patientId,
          opNumber: patient.opNumber,
          billId: "",
          medicineName: medicine.medicineName,
          batch: medicine.batch || "",
          quantity: dispenseQty,
          price: medicine.price,
          amount: Number(amount) || (medicine.price * dispenseQty),
          dispensedBy: session.username,
        },
      });

      return { updatedMed, dispenseRecord };
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PHARMACY",
        action: "DISPENSE_MEDICINE",
        recordId: result.dispenseRecord.id,
      },
    });

    return NextResponse.json({
      message: "Medicine dispensed successfully",
      record: result.dispenseRecord,
    });
  } catch (error: any) {
    console.error("Dispense Medicine API Error:", error);
    return NextResponse.json({ message: "Failed to dispense medicine", error: error.message }, { status: 500 });
  }
}
