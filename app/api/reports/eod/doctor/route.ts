import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["DOCTOR", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const targetDate = dateStr ? new Date(dateStr) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // If role is DOCTOR, force doctorName to be session.username
    let doctorName = searchParams.get("doctorName");
    if (session.role.toUpperCase() === "DOCTOR") {
      doctorName = session.username;
    }

    if (!doctorName) {
      return NextResponse.json({ message: "Doctor name is required" }, { status: 400 });
    }

    const [todayConsultations, todayInvestigations, todayProcedures, allBills] = await Promise.all([
      prisma.consultation.findMany({
        where: {
          doctor: doctorName,
          consultationDate: { gte: startOfDay, lte: endOfDay },
        },
        include: { patient: true },
      }),
      prisma.investigationTransaction.findMany({
        where: {
          doctor: doctorName,
          orderedDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.oTProcedure.findMany({
        where: {
          doctor: doctorName,
          date: {
            gte: startOfDay.toISOString().split("T")[0],
            lte: endOfDay.toISOString().split("T")[0],
          },
        },
      }),
      prisma.bill.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    // Match bills to this doctor's consultations today
    const patientOpNumbers = todayConsultations.map((c) => c.opNumber);
    const doctorBills = allBills.filter((b) => patientOpNumbers.includes(b.opNumber));
    const revenueGenerated = doctorBills.filter((b) => b.status === "Paid").reduce((sum, b) => sum + Number(b.total), 0);

    const patientsConsulted = todayConsultations.length;
    const patientsPending = todayConsultations.filter((c) => c.status !== "Completed").length;
    const patientsCompleted = todayConsultations.filter((c) => c.status === "Completed").length;

    // Enrich consultations for frontend compatibility
    const formattedConsultations = todayConsultations.map((c) => ({
      id: c.id,
      patientId: c.patientId,
      opNumber: c.opNumber,
      doctor: c.doctor,
      department: c.department,
      diagnosis: c.diagnosis,
      clinicalNotes: c.notes,
      prescription: c.prescription,
      followUpDate: c.followUpDate,
      consultationDate: c.consultationDate.toISOString(),
      status: c.status,
      patientName: c.patient ? c.patient.fullName : "Unknown Patient",
      complaint: c.patient ? c.patient.complaint : "N/A",
      age: c.patient ? c.patient.age : "",
      gender: c.patient ? c.patient.gender : "",
    }));

    // Log action
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "REPORTS",
        action: "GENERATE_DOCTOR_EOD",
        recordId: `${doctorName}_${startOfDay.toISOString().split("T")[0]}`,
      },
    });

    return NextResponse.json({
      doctorName,
      date: startOfDay.toISOString().split("T")[0],
      stats: {
        patientsConsulted,
        patientsPending,
        patientsCompleted,
        consultationsCompleted: patientsCompleted,
        investigationsOrdered: todayInvestigations.length,
        otProceduresScheduled: todayProcedures.length,
        revenueGenerated,
      },
      consultations: formattedConsultations,
      investigations: todayInvestigations,
      procedures: todayProcedures,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to generate Doctor EOD report", error: error.message }, { status: 500 });
  }
}
