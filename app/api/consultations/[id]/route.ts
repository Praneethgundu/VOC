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

    const existing = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Consultation not found" }, { status: 404 });
    }

    // Support both clinicalNotes (from body) and notes (internal schema)
    const notesContent = body.clinicalNotes !== undefined ? body.clinicalNotes : (body.notes !== undefined ? body.notes : existing.notes);

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        doctor: body.doctor !== undefined ? body.doctor : existing.doctor,
        department: body.department !== undefined ? body.department : existing.department,
        diagnosis: body.diagnosis !== undefined ? body.diagnosis : existing.diagnosis,
        notes: notesContent,
        prescription: body.prescription !== undefined ? (typeof body.prescription === "string" ? body.prescription : JSON.stringify(body.prescription)) : existing.prescription,
        followUpDate: body.followUpDate !== undefined ? String(body.followUpDate) : existing.followUpDate,
        status: body.status !== undefined ? body.status : existing.status,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "CONSULTATIONS",
        action: "UPDATE_CONSULTATION",
        recordId: id,
      },
    });

    return NextResponse.json({ message: "Consultation updated successfully", consultation: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update consultation", error: error.message }, { status: 500 });
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

    const existing = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Consultation not found" }, { status: 404 });
    }

    await prisma.consultation.delete({
      where: { id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "CONSULTATIONS",
        action: "DELETE_CONSULTATION",
        recordId: id,
      },
    });

    return NextResponse.json({ message: "Consultation deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete consultation", error: error.message }, { status: 500 });
  }
}
