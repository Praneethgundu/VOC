import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ opNumber: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { opNumber } = await params;
    const body = await req.json();

    const existing = await prisma.patient.findUnique({
      where: { opNumber },
    });

    if (!existing) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const updated = await prisma.patient.update({
      where: { opNumber },
      data: {
        fullName: body.fullName !== undefined ? body.fullName : existing.fullName,
        age: body.age !== undefined ? String(body.age) : existing.age,
        gender: body.gender !== undefined ? body.gender : existing.gender,
        phone: body.phone !== undefined ? String(body.phone) : existing.phone,
        bloodGroup: body.bloodGroup !== undefined ? body.bloodGroup : existing.bloodGroup,
        department: body.department !== undefined ? body.department : existing.department,
        doctor: body.doctor !== undefined ? body.doctor : existing.doctor,
        complaint: body.complaint !== undefined ? body.complaint : existing.complaint,
        address: body.address !== undefined ? body.address : existing.address,
        status: body.status !== undefined ? body.status : existing.status,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PATIENTS",
        action: "UPDATE_PATIENT",
        recordId: opNumber,
      },
    });

    return NextResponse.json({ message: "Patient updated successfully", patient: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update patient", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ opNumber: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { opNumber } = await params;

    const existing = await prisma.patient.findUnique({
      where: { opNumber },
    });

    if (!existing) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    await prisma.patient.delete({
      where: { opNumber },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PATIENTS",
        action: "DELETE_PATIENT",
        recordId: opNumber,
      },
    });

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete patient", error: error.message }, { status: 500 });
  }
}
