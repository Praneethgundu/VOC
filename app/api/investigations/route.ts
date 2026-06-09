import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.investigationTransaction.findMany({
      orderBy: { orderedDate: "desc" },
    });

    const enriched = await Promise.all(
      transactions.map(async (t) => {
        const p = await prisma.patient.findUnique({
          where: { opNumber: t.opNumber },
          select: { fullName: true },
        });
        return {
          ...t,
          patientName: p ? p.fullName : "Unknown Patient",
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch investigations", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["DOCTOR", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const newTx = await prisma.investigationTransaction.create({
      data: {
        id: require("crypto").randomBytes(4).toString("hex"),
        patientId: body.patientId || "",
        opNumber: body.opNumber,
        testName: body.testName,
        amount: Number(body.amount) || 0,
        doctor: body.doctor || session.username,
        status: body.status || "Pending",
        result: body.result || "",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "INVESTIGATIONS",
        action: "ORDER_TEST",
        recordId: newTx.id,
      },
    });

    return NextResponse.json(
      { message: "Test ordered successfully", investigation: newTx },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to order test", error: error.message }, { status: 500 });
  }
}
