import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";
import { logAuditAction } from "@/lib/utils/auditLogger";
import { patientSchema } from "@/lib/validations/schemas";

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
    const validation = patientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data", errors: validation.error.format() }, { status: 400 });
    }
    const data = validation.data;

    const count = await prisma.patient.count();
    
    // Double-booking validation
    if (data.date && data.time && data.doctor) {
      const existingAppointments = await prisma.patient.findMany({
        where: {
          appointmentDate: data.date,
          doctor: data.doctor,
          status: "Active"
        }
      });
      
      const newMinutes = parseInt(data.time.split(':')[0]) * 60 + parseInt(data.time.split(':')[1]);

      const conflict = existingAppointments.find(app => {
        if (!app.appointmentTime) return false;
        const existingMinutes = parseInt(app.appointmentTime.split(':')[0]) * 60 + parseInt(app.appointmentTime.split(':')[1]);
        return Math.abs(existingMinutes - newMinutes) < 10;
      });

      if (conflict) {
        return NextResponse.json({ message: "Doctor already has a patient scheduled within 10 minutes of this time." }, { status: 400 });
      }
    }
    
    const opNumber = data.opNumber || `OP/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;
    const patientId = require("crypto").randomUUID();

    const newPatient = await prisma.patient.create({
      data: {
        patientId,
        opNumber,
        fullName: data.fullName || "",
        age: String(data.age || ""),
        gender: data.gender || "Other",
        phone: String(data.phone || ""),
        bloodGroup: data.bloodGroup || "Unknown",
        department: data.department || "Orthopaedics",
        doctor: data.doctor || "",
        complaint: data.complaint || "",
        address: data.address || "",
        status: data.status || "Active",
        appointmentDate: data.date || "",
        appointmentTime: data.time || "",
      },
    });

    // Write audit log
    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "PATIENTS",
      action: "REGISTER_PATIENT",
      recordId: newPatient.opNumber,
      patientId: newPatient.patientId
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
      await logAuditAction({
        req,
        user: "System",
        role: "Backend",
        module: "CONSULTATIONS",
        action: "AUTO_QUEUE",
        recordId: newPatient.opNumber,
        patientId: newPatient.patientId
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

export async function PUT(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const opNumber = searchParams.get("opNumber");

    if (!opNumber) {
      return NextResponse.json({ message: "OP Number is required" }, { status: 400 });
    }

    const body = await req.json();
    const validation = patientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data", errors: validation.error.format() }, { status: 400 });
    }
    const data = validation.data;

    const existing = await prisma.patient.findUnique({
      where: { opNumber },
    });

    if (!existing) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const checkDate = data.date !== undefined ? data.date : existing.appointmentDate;
    const checkTime = data.time !== undefined ? data.time : existing.appointmentTime;
    const checkDoctor = data.doctor !== undefined ? data.doctor : existing.doctor;

    if (checkDate && checkTime && checkDoctor) {
      const existingAppointments = await prisma.patient.findMany({
        where: {
          appointmentDate: checkDate,
          doctor: checkDoctor,
          status: "Active",
          opNumber: { not: opNumber }
        }
      });
      
      const newMinutes = parseInt(checkTime.split(':')[0]) * 60 + parseInt(checkTime.split(':')[1]);

      const conflict = existingAppointments.find(app => {
        if (!app.appointmentTime) return false;
        const existingMinutes = parseInt(app.appointmentTime.split(':')[0]) * 60 + parseInt(app.appointmentTime.split(':')[1]);
        return Math.abs(existingMinutes - newMinutes) < 10;
      });

      if (conflict) {
        return NextResponse.json({ message: "Doctor already has a patient scheduled within 10 minutes of this time." }, { status: 400 });
      }
    }

    const updated = await prisma.patient.update({
      where: { opNumber },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : existing.fullName,
        age: data.age !== undefined ? String(data.age) : existing.age,
        gender: data.gender !== undefined ? data.gender : existing.gender,
        phone: data.phone !== undefined ? String(data.phone) : existing.phone,
        bloodGroup: data.bloodGroup !== undefined ? data.bloodGroup : existing.bloodGroup,
        department: data.department !== undefined ? data.department : existing.department,
        doctor: data.doctor !== undefined ? data.doctor : existing.doctor,
        complaint: data.complaint !== undefined ? data.complaint : existing.complaint,
        address: data.address !== undefined ? data.address : existing.address,
        status: data.status !== undefined ? data.status : existing.status,
        appointmentDate: data.date !== undefined ? data.date : existing.appointmentDate,
        appointmentTime: data.time !== undefined ? data.time : existing.appointmentTime,
      },
    });

    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "PATIENTS",
      action: "UPDATE_PATIENT",
      recordId: opNumber,
      patientId: existing.patientId
    });

    return NextResponse.json({ message: "Patient updated successfully", patient: updated });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update patient", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const opNumber = searchParams.get("opNumber");

    if (!opNumber) {
      return NextResponse.json({ message: "OP Number is required" }, { status: 400 });
    }

    const existing = await prisma.patient.findUnique({
      where: { opNumber },
    });

    if (!existing) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    await prisma.patient.delete({
      where: { opNumber },
    });

    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "PATIENTS",
      action: "DELETE_PATIENT",
      recordId: opNumber,
      patientId: existing.patientId
    });

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete patient", error: error.message }, { status: 500 });
  }
}
