import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ medicineId: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["PHARMACIST", "RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { medicineId } = await params;
    const body = await req.json();

    const existing = await prisma.inventoryItem.findUnique({
      where: { medicineId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
    }

    const updated = await prisma.inventoryItem.update({
      where: { medicineId },
      data: {
        medicineName: body.medicineName !== undefined ? body.medicineName : existing.medicineName,
        category: body.category !== undefined ? body.category : existing.category,
        stock: body.quantity !== undefined ? Number(body.quantity) : (body.stock !== undefined ? Number(body.stock) : existing.stock),
        price: body.price !== undefined ? Number(body.price) : existing.price,
        mrp: body.mrp !== undefined ? Number(body.mrp) : existing.mrp,
        batch: body.batch !== undefined ? body.batch : existing.batch,
        distributor: body.distributor !== undefined ? body.distributor : existing.distributor,
        expiryDate: body.expiryDate !== undefined ? body.expiryDate : existing.expiryDate,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PHARMACY",
        action: "UPDATE_MEDICINE",
        recordId: medicineId,
      },
    });

    return NextResponse.json({ message: "Medicine updated successfully", medicine: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update medicine", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ medicineId: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["PHARMACIST", "RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { medicineId } = await params;

    const existing = await prisma.inventoryItem.findUnique({
      where: { medicineId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
    }

    await prisma.inventoryItem.delete({
      where: { medicineId },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PHARMACY",
        action: "DELETE_MEDICINE",
        recordId: medicineId,
      },
    });

    return NextResponse.json({ message: "Medicine deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete medicine", error: error.message }, { status: 500 });
  }
}
