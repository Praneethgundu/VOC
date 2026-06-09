import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession } from "@/utils/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ opNumber: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { opNumber } = await params;

    const profile = await prisma.patient.findUnique({
      where: { opNumber },
    });

    if (!profile) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const [consultations, investigations, bills, procedures, pharmacy] = await Promise.all([
      prisma.consultation.findMany({
        where: { opNumber },
        orderBy: { consultationDate: "desc" },
      }),
      prisma.investigationTransaction.findMany({
        where: { opNumber },
        orderBy: { orderedDate: "desc" },
      }),
      prisma.bill.findMany({
        where: { opNumber },
        orderBy: { date: "desc" },
      }),
      prisma.oTProcedure.findMany({
        where: { opNumber },
        orderBy: { date: "desc" },
      }),
      prisma.pharmacyDispense.findMany({
        where: { opNumber },
        orderBy: { dispensedDate: "desc" },
      }),
    ]);

    // Parse items for bills
    const formattedBills = bills.map((b) => {
      let items = [];
      try {
        items = JSON.parse(b.items);
      } catch (e) {
        items = [];
      }
      return {
        ...b,
        id: b.billNumber, // Map billNumber to id for frontend compatibility
        items,
      };
    });

    return NextResponse.json({
      profile,
      consultations,
      investigations,
      bills: formattedBills,
      procedures,
      pharmacy,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch patient record", error: error.message }, { status: 500 });
  }
}
