import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const consultations = await prisma.consultation.findMany({
      include: {
        patient: true,
      },
      orderBy: {
        consultationDate: "desc",
      },
    });

    const enriched = consultations.map((c) => ({
      id: c.id,
      patientId: c.patientId,
      opNumber: c.opNumber,
      doctor: c.doctor,
      department: c.department,
      diagnosis: c.diagnosis,
      clinicalNotes: c.notes, // Map notes to clinicalNotes for frontend compatibility
      prescription: c.prescription,
      followUpDate: c.followUpDate,
      consultationDate: c.consultationDate.toISOString(),
      status: c.status,
      patientName: c.patient ? c.patient.fullName : "Unknown Patient",
      complaint: c.patient ? c.patient.complaint : "N/A",
      age: c.patient ? c.patient.age : "",
      gender: c.patient ? c.patient.gender : "",
      bloodGroup: c.patient?.bloodGroup || "",
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch consultations", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["DOCTOR", "RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { opNumber: body.opNumber },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const newConsultation = await prisma.consultation.create({
      data: {
        patientId: patient.patientId,
        opNumber: patient.opNumber,
        doctor: body.doctor || "",
        department: body.department || "",
        status: body.status || "Waiting",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "CONSULTATIONS",
        action: "NEW_CONSULTATION",
        recordId: newConsultation.id,
      },
    });

    return NextResponse.json(
      { message: "Consultation created", consultation: newConsultation },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create consultation", error: error.message }, { status: 500 });
  }
}
