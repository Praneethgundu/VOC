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

    if (!authorizeRole(session, ["DOCTOR", "RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.investigationTransaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Investigation not found" }, { status: 404 });
    }

    const updated = await prisma.investigationTransaction.update({
      where: { id },
      data: {
        testName: body.testName !== undefined ? body.testName : existing.testName,
        amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
        status: body.status !== undefined ? body.status : existing.status,
        result: body.result !== undefined ? body.result : existing.result,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "INVESTIGATIONS",
        action: "UPDATE_TEST",
        recordId: id,
      },
    });

    return NextResponse.json({ message: "Test updated successfully", investigation: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update test", error: error.message }, { status: 500 });
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

    if (!authorizeRole(session, ["DOCTOR", "RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.investigationTransaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Investigation not found" }, { status: 404 });
    }

    await prisma.investigationTransaction.delete({
      where: { id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "INVESTIGATIONS",
        action: "DELETE_TEST",
        recordId: id,
      },
    });

    return NextResponse.json({ message: "Test deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete test", error: error.message }, { status: 500 });
  }
}
