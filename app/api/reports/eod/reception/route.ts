import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";
import { z } from "zod";

const querySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }).nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["RECEPTIONIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const parsedParams = querySchema.safeParse({ date: searchParams.get("date") });
    if (!parsedParams.success) {
      return NextResponse.json({ message: "Invalid parameters", errors: parsedParams.error.format() }, { status: 400 });
    }
    const dateStr = parsedParams.data.date;
    const targetDate = dateStr ? new Date(dateStr) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [todayPatients, todayConsultations, todayBills] = await Promise.all([
      prisma.patient.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.consultation.findMany({
        where: {
          consultationDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.bill.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    const totalRegistrations = todayPatients.length;
    const newPatients = totalRegistrations;
    const returningPatients = todayConsultations.length - totalRegistrations > 0 ? todayConsultations.length - totalRegistrations : 0;

    const paidBills = todayBills.filter((b) => b.status === "Paid");
    const pendingBills = todayBills.filter((b) => b.status === "Unpaid" || b.paymentMode === "Pending");

    const cashCollected = paidBills.filter((b) => b.paymentMode === "Cash").reduce((sum, b) => sum + Number(b.total), 0);
    const upiCollected = paidBills.filter((b) => b.paymentMode === "UPI").reduce((sum, b) => sum + Number(b.total), 0);
    const cardCollected = paidBills.filter((b) => b.paymentMode === "Card").reduce((sum, b) => sum + Number(b.total), 0);
    const pendingAmount = pendingBills.reduce((sum, b) => sum + Number(b.total), 0);
    const collectionsReceived = cashCollected + upiCollected + cardCollected;

    const completedRegistrations = todayConsultations.filter((c) => c.status === "Completed").length;
    const pendingRegistrations = todayConsultations.filter((c) => c.status !== "Completed").length;

    // Log action
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "REPORTS",
        action: "GENERATE_RECEPTION_EOD",
        recordId: startOfDay.toISOString().split("T")[0],
      },
    });

    return NextResponse.json({
      date: startOfDay.toISOString().split("T")[0],
      stats: {
        totalRegistrations,
        newPatients,
        returningPatients,
        opRegistrations: todayConsultations.length,
        billsGenerated: todayBills.length,
        billsPaid: paidBills.length,
        billsPending: pendingBills.length,
        collectionsReceived,
        pendingAmount,
      },
      paymentModeBreakdown: {
        cash: cashCollected,
        upi: upiCollected,
        card: cardCollected,
        pending: pendingAmount,
      },
      queueStatus: {
        pendingRegistrations,
        completedRegistrations,
      },
      patients: todayPatients,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to generate Reception EOD report", error: error.message }, { status: 500 });
  }
}
