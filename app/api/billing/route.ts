import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bills = await prisma.bill.findMany({
      orderBy: { date: "desc" },
    });

    const formatted = bills.map((b) => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(b.items);
      } catch (e) {
        parsedItems = [];
      }

      return {
        id: b.billNumber, // Map billNumber to id
        patientId: b.patientId,
        opNumber: b.opNumber,
        items: parsedItems,
        total: b.total,
        paidAmount: b.paidAmount,
        pendingAmount: b.pendingAmount,
        paymentMode: b.paymentMode,
        status: b.status,
        date: b.date.toISOString(),
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch bills", error: error.message }, { status: 500 });
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
    const items = Array.isArray(body.items) ? body.items : [];
    const total = items.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);

    const paidAmount = Number(body.paidAmount) !== undefined && !isNaN(Number(body.paidAmount))
      ? Number(body.paidAmount)
      : (body.paymentMode === "Pending" ? 0 : total);
    
    const pendingAmount = Math.max(0, total - paidAmount);
    const billNumber = "BILL-" + require("crypto").randomBytes(3).toString("hex").toUpperCase();

    const newBill = await prisma.bill.create({
      data: {
        billNumber,
        patientId: body.patientId || "",
        opNumber: body.opNumber || "Unknown",
        items: JSON.stringify(items),
        total,
        paidAmount,
        pendingAmount,
        paymentMode: body.paymentMode || "Pending",
        status: body.status || (pendingAmount > 0 ? "Unpaid" : "Paid"),
        consultationCharges: Number(body.consultationCharges) || 0,
        investigationCharges: Number(body.investigationCharges) || 0,
        medicineCharges: Number(body.medicineCharges) || 0,
        otCharges: Number(body.otCharges) || 0,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "BILLING",
        action: "GENERATE_BILL",
        recordId: billNumber,
      },
    });

    return NextResponse.json({
      message: "Bill generated successfully",
      bill: {
        ...newBill,
        id: newBill.billNumber,
        items,
      },
    });
  } catch (error: any) {
    console.error("Generate Bill Error:", error);
    return NextResponse.json({ message: "Failed to generate bill", error: error.message }, { status: 500 });
  }
}
