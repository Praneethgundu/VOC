import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      newPatientsToday,
      consultationsToday,
      billsToday,
      totalPatients,
      totalBills,
    ] = await Promise.all([
      prisma.patient.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.consultation.count({
        where: {
          consultationDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.bill.findMany({
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: "Paid",
        },
        select: {
          total: true,
        },
      }),
      prisma.patient.count(),
      prisma.bill.count(),
    ]);

    const revenueToday = billsToday.reduce((sum, b) => sum + Number(b.total), 0);

    return NextResponse.json({
      newPatientsToday,
      consultationsToday,
      revenueToday,
      totalPatients,
      totalBills,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to generate dashboard stats", error: error.message }, { status: 500 });
  }
}
