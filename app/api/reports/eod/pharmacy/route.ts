import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["PHARMACIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const targetDate = dateStr ? new Date(dateStr) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [todayDispensed, allInventory, todayBills] = await Promise.all([
      prisma.pharmacyDispense.findMany({
        where: {
          dispensedDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.inventoryItem.findMany(),
      prisma.bill.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    // Filter bills related to pharmacy/medicines
    const pharmacyBills = todayBills.filter((b) => {
      let isPharmacy = false;
      try {
        const items = JSON.parse(b.items);
        isPharmacy = items.some((item: any) => item.category === "Pharmacy" || item.serviceName.toLowerCase().includes("medicine"));
      } catch (e) {
        isPharmacy = false;
      }
      return isPharmacy;
    });

    const medicinesDispensed = todayDispensed.length;
    const revenueGenerated = pharmacyBills.filter((b) => b.status === "Paid").reduce((sum, b) => sum + Number(b.total), 0);

    const lowStockMedicines = allInventory.filter((i) => i.stock > 0 && i.stock <= 10).length;
    const outOfStockMedicines = allInventory.filter((i) => i.stock === 0).length;

    // Aggregate usage summary by medicineName
    const usageSummary: Record<string, { count: number; amount: number }> = {};
    todayDispensed.forEach((d) => {
      const medName = d.medicineName || "Unknown Medicine";
      if (!usageSummary[medName]) {
        usageSummary[medName] = { count: 0, amount: 0 };
      }
      usageSummary[medName].count += d.quantity;
      usageSummary[medName].amount += Number(d.amount);
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "REPORTS",
        action: "GENERATE_PHARMACY_EOD",
        recordId: startOfDay.toISOString().split("T")[0],
      },
    });

    return NextResponse.json({
      date: startOfDay.toISOString().split("T")[0],
      stats: {
        medicinesDispensed,
        totalPrescriptionsProcessed: pharmacyBills.length,
        revenueGenerated,
        lowStockMedicines,
        outOfStockMedicines,
      },
      inventoryAlerts: allInventory.filter((i) => i.stock <= 10),
      dispensed: todayDispensed,
      usageSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to generate Pharmacy EOD report", error: error.message }, { status: 500 });
  }
}
