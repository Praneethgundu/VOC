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

    if (!authorizeRole(session, ["DOCTOR", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.oTProcedure.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Procedure not found" }, { status: 404 });
    }

    const updated = await prisma.oTProcedure.update({
      where: { id },
      data: {
        procedureName: body.procedureName !== undefined ? body.procedureName : (body.procedure !== undefined ? body.procedure : existing.procedureName),
        cost: body.cost !== undefined ? Number(body.cost) : (body.fee !== undefined ? Number(body.fee) : existing.cost),
        status: body.status !== undefined ? body.status : existing.status,
        date: body.date !== undefined ? body.date : existing.date,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        doctor: body.doctor !== undefined ? body.doctor : existing.doctor,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "OT",
        action: "UPDATE_PROCEDURE",
        recordId: id,
      },
    });

    return NextResponse.json({ message: "Procedure updated successfully", procedure: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update procedure", error: error.message }, { status: 500 });
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

    if (!authorizeRole(session, ["DOCTOR", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.oTProcedure.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Procedure not found" }, { status: 404 });
    }

    await prisma.oTProcedure.delete({
      where: { id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "OT",
        action: "DELETE_PROCEDURE",
        recordId: id,
      },
    });

    return NextResponse.json({ message: "Procedure deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete procedure", error: error.message }, { status: 500 });
  }
}
