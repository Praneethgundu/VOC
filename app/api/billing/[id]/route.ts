import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id: billNumber } = await params;
    const body = await req.json();

    const existing = await prisma.bill.findUnique({
      where: { billNumber },
    });

    if (!existing) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    const items = body.items !== undefined ? (typeof body.items === "string" ? body.items : JSON.stringify(body.items)) : existing.items;
    const total = body.total !== undefined ? Number(body.total) : existing.total;
    const paidAmount = body.paidAmount !== undefined ? Number(body.paidAmount) : existing.paidAmount;
    const pendingAmount = body.pendingAmount !== undefined ? Number(body.pendingAmount) : (total - paidAmount);

    const updated = await prisma.bill.update({
      where: { billNumber },
      data: {
        paymentMode: body.paymentMode !== undefined ? body.paymentMode : existing.paymentMode,
        status: body.status !== undefined ? body.status : existing.status,
        items,
        total,
        paidAmount,
        pendingAmount,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "BILLING",
        action: "UPDATE_BILL",
        recordId: billNumber,
      },
    });

    return NextResponse.json({ message: "Bill updated successfully", bill: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update bill", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id: billNumber } = await params;

    const existing = await prisma.bill.findUnique({
      where: { billNumber },
    });

    if (!existing) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    await prisma.bill.delete({
      where: { billNumber },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "BILLING",
        action: "DELETE_BILL",
        recordId: billNumber,
      },
    });

    return NextResponse.json({ message: "Bill deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete bill", error: error.message }, { status: 500 });
  }
}
