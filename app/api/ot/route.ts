import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const procedures = await prisma.oTProcedure.findMany({
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" }
      ],
    });

    const enriched = await Promise.all(
      procedures.map(async (p) => {
        const pat = await prisma.patient.findUnique({
          where: { opNumber: p.opNumber },
          select: { fullName: true, age: true },
        });
        return {
          ...p,
          patientName: pat ? pat.fullName : "Unknown Patient",
          age: pat ? pat.age : "",
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch OT procedures", error: error.message }, { status: 500 });
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

    const procedureName = body.procedureName || body.procedure || "";
    const requestedDateStr = body.date || new Date().toISOString().split("T")[0];

    const proceduresOnDay = await prisma.oTProcedure.findMany({
      where: {
        opNumber: body.opNumber,
        date: {
          startsWith: requestedDateStr
        }
      }
    });

    const isDuplicate = proceduresOnDay.some(p => p.procedureName.trim().toLowerCase() === procedureName.trim().toLowerCase());

    if (isDuplicate) {
      return NextResponse.json({ message: `Duplicate: ${procedureName} is already scheduled for this patient on this day.` }, { status: 400 });
    }

    const id = "OT-" + require("crypto").randomBytes(3).toString("hex").toUpperCase();
    
    const newProcedure = await prisma.oTProcedure.create({
      data: {
        id,
        patientId: patient.patientId,
        opNumber: patient.opNumber,
        doctor: body.doctor || session.username,
        procedureName: body.procedureName || body.procedure || "",
        cost: Number(body.cost || body.fee) || 0,
        status: body.status || "Scheduled",
        date: body.date || new Date().toISOString().split("T")[0],
        notes: body.notes || "",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "OT",
        action: "SCHEDULE_PROCEDURE",
        recordId: newProcedure.id,
      },
    });

    return NextResponse.json(
      { message: "OT Procedure scheduled successfully", procedure: newProcedure },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to schedule procedure", error: error.message }, { status: 500 });
  }
}
