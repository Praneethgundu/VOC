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
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
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

    const [
      todayPatients,
      todayConsultations,
      todayBills,
      todayInvestigations,
      todayProcedures,
      todayDispensed,
    ] = await Promise.all([
      prisma.patient.findMany({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.consultation.findMany({
        where: { consultationDate: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.bill.findMany({
        where: { date: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.investigationTransaction.findMany({
        where: { orderedDate: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.oTProcedure.findMany({
        where: {
          date: {
            gte: startOfDay.toISOString().split("T")[0],
            lte: endOfDay.toISOString().split("T")[0],
          },
        },
      }),
      prisma.pharmacyDispense.findMany({
        where: { dispensedDate: { gte: startOfDay, lte: endOfDay } },
      }),
    ]);

    const paidBills = todayBills.filter((b) => b.status === "Paid");
    const pendingBills = todayBills.filter((b) => b.status === "Unpaid" || b.paymentMode === "Pending");

    const totalRevenue = paidBills.reduce((sum, b) => sum + Number(b.total), 0);
    const pendingRevenue = pendingBills.reduce((sum, b) => sum + Number(b.total), 0);

    // Group department revenue
    const departmentRevenueMap: Record<string, number> = {};
    paidBills.forEach((b) => {
      // Find department or infer
      const dept = "General"; // Default
      departmentRevenueMap[dept] = (departmentRevenueMap[dept] || 0) + Number(b.total);
    });

    // Group doctor revenue
    const doctorRevenueMap: Record<string, number> = {};
    paidBills.forEach((b) => {
      const consult = todayConsultations.find((c) => c.opNumber === b.opNumber);
      const docName = consult ? consult.doctor : "Unassigned";
      doctorRevenueMap[docName] = (doctorRevenueMap[docName] || 0) + Number(b.total);
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "REPORTS",
        action: "GENERATE_ADMIN_EOD",
        recordId: startOfDay.toISOString().split("T")[0],
      },
    });

    // Format bills for compatibility
    const formattedBills = todayBills.map((b) => ({
      ...b,
      id: b.billNumber,
      items: JSON.parse(b.items || "[]"),
    }));

    return NextResponse.json({
      date: startOfDay.toISOString().split("T")[0],
      stats: {
        totalRegistrations: todayPatients.length,
        totalConsultations: todayConsultations.length,
        totalInvestigations: todayInvestigations.length,
        totalProcedures: todayProcedures.length,
        totalMedicinesDispensed: todayDispensed.length,
        totalRevenue,
        pendingRevenue,
        collections: totalRevenue,
        pendingBills: pendingBills.length,
      },
      departmentRevenue: Object.keys(departmentRevenueMap).map((k) => ({
        department: k,
        amount: departmentRevenueMap[k],
      })),
      doctorRevenue: Object.keys(doctorRevenueMap).map((k) => ({
        doctor: k,
        amount: doctorRevenueMap[k],
      })),
      recentBills: formattedBills,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to generate Admin EOD report", error: error.message }, { status: 500 });
  }
}
