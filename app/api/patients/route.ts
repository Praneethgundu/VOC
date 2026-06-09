import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch patients", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const count = await prisma.patient.count();
    
    const opNumber = body.opNumber || `OP/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;
    const patientId = require("crypto").randomUUID();

    const newPatient = await prisma.patient.create({
      data: {
        patientId,
        opNumber,
        fullName: body.fullName || "",
        age: String(body.age || ""),
        gender: body.gender || "Other",
        phone: String(body.phone || ""),
        bloodGroup: body.bloodGroup || "Unknown",
        department: body.department || "Orthopaedics",
        doctor: body.doctor || "",
        complaint: body.complaint || "",
        address: body.address || "",
        status: body.status || "Active",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PATIENTS",
        action: "REGISTER_PATIENT",
        recordId: newPatient.opNumber,
      },
    });

    // Automatically add to consultation queue
    try {
      await prisma.consultation.create({
        data: {
          patientId: newPatient.patientId,
          opNumber: newPatient.opNumber,
          doctor: newPatient.doctor || "",
          department: newPatient.department || "",
          status: "Waiting",
        },
      });
      // Log audit action for consultation queue insertion
      await prisma.auditLog.create({
        data: {
          user: "System",
          role: "Backend",
          module: "CONSULTATIONS",
          action: "AUTO_QUEUE",
          recordId: newPatient.opNumber,
        },
      });
    } catch (err) {
      console.error("Failed to auto add patient to consultation queue:", err);
    }

    return NextResponse.json(
      { message: "Patient registered successfully", patient: newPatient },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Patient Registration Error:", error);
    return NextResponse.json({ message: "Failed to register patient", error: error.message }, { status: 500 });
  }
}
