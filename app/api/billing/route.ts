import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";
import { logAuditAction } from "@/lib/utils/auditLogger";
import { billingSchema } from "@/lib/validations/schemas";

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
    const validation = billingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data", errors: validation.error.format() }, { status: 400 });
    }
    const data = validation.data;

    const items = Array.isArray(data.items) ? data.items : [];
    const total = items.reduce((acc: number, item: any) => {
      const amt = Number(item.amount) || 0;
      const disc = Number(item.discount) || 0;
      return acc + Math.max(0, amt - (amt * disc / 100));
    }, 0) + 
                  (data.consultationCharges || 0) + (data.investigationCharges || 0) + 
                  (data.medicineCharges || 0) + (data.otCharges || 0);

    const paidAmount = data.paidAmount !== undefined && data.paidAmount !== null
      ? Number(data.paidAmount)
      : ((data.status === "Unpaid" || data.status === "Pending" || data.paymentMode === "Pending") ? 0 : total);
    
    const pendingAmount = Math.max(0, total - paidAmount);
    const billNumber = "BILL-" + require("crypto").randomBytes(3).toString("hex").toUpperCase();

    const newBill = await prisma.bill.create({
      data: {
        billNumber,
        patientId: data.patientId || "",
        opNumber: data.opNumber || "Unknown",
        items: JSON.stringify(items),
        total,
        paidAmount,
        pendingAmount,
        paymentMode: data.paymentMode || "Pending",
        status: pendingAmount > 0 ? "Unpaid" : "Paid",
        consultationCharges: Number(data.consultationCharges) || 0,
        investigationCharges: Number(data.investigationCharges) || 0,
        medicineCharges: Number(data.medicineCharges) || 0,
        otCharges: Number(data.otCharges) || 0,
      },
    });

    // Write audit log
    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "BILLING",
      action: "GENERATE_BILL",
      recordId: billNumber,
      patientId: newBill.patientId
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
