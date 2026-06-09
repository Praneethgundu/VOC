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
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const existing = await prisma.bill.findUnique({
      where: { billNumber },
    });

    if (!existing) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    const isPaid = status === "Paid";
    const paidAmount = isPaid ? existing.total : existing.paidAmount;
    const pendingAmount = isPaid ? 0 : existing.pendingAmount;

    const updated = await prisma.bill.update({
      where: { billNumber },
      data: {
        status,
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
        action: "UPDATE_BILL_PAYMENT",
        recordId: billNumber,
      },
    });

    return NextResponse.json({ message: "Payment status updated successfully", bill: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update payment status", error: error.message }, { status: 500 });
  }
}
