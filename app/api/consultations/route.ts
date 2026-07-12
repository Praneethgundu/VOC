import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // --- AUTO CARRY-FORWARD LOGIC ---
    // If a patient misses their follow-up date, increment the date to today so they stay in the queue
    // This is valid until 30 days after their last completed consultation.
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const todayStart = new Date(`${todayStr}T00:00:00Z`);

    const overdue = await prisma.consultation.findMany({
      where: {
        status: "Waiting",
        consultationDate: { lt: todayStart }
      }
    });

    for (const c of overdue) {
      const lastCompleted = await prisma.consultation.findFirst({
        where: {
          patientId: c.patientId,
          status: { notIn: ["Waiting", "Missed"] }
        },
        orderBy: { consultationDate: "desc" }
      });
      
      const referenceDate = lastCompleted ? lastCompleted.consultationDate : c.consultationDate;
      const diffDays = (now.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24);

      if (diffDays <= 30) {
        // Carry forward to today
        await prisma.consultation.update({
          where: { id: c.id },
          data: { consultationDate: todayStart }
        });
      } else {
        // Expire it after 30 days
        await prisma.consultation.update({
          where: { id: c.id },
          data: { status: "Missed" }
        });
      }
    }
    // --- END AUTO CARRY-FORWARD LOGIC ---

    const consultations = await prisma.consultation.findMany({
      include: {
        patient: true,
      },
      orderBy: {
        consultationDate: "asc",
      },
    });

    const visitCounts: Record<string, number> = {};

    const enrichedAsc = consultations.map((c) => {
      if (!visitCounts[c.patientId]) visitCounts[c.patientId] = 0;
      visitCounts[c.patientId]++;

      return {
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
        bloodGroup: c.patient ? c.patient.bloodGroup : "",
        visitNumber: visitCounts[c.patientId]
      };
    });

    const enriched = enrichedAsc.reverse();
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
