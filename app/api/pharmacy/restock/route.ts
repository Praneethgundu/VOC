import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["PHARMACIST", "RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { medicineId, quantity } = await req.json();

    if (!medicineId || quantity === undefined) {
      return NextResponse.json({ message: "Medicine ID and Quantity are required" }, { status: 400 });
    }

    const existing = await prisma.inventoryItem.findUnique({
      where: { medicineId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
    }

    const restockQty = Number(quantity);

    const updated = await prisma.inventoryItem.update({
      where: { medicineId },
      data: {
        stock: {
          increment: restockQty,
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PHARMACY",
        action: "RESTOCK_MEDICINE",
        recordId: medicineId,
      },
    });

    return NextResponse.json({
      message: "Medicine restocked successfully",
      medicine: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to restock medicine", error: error.message }, { status: 500 });
  }
}
