import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.inventoryItem.findMany();
    return NextResponse.json(inventory);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch inventory", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["PHARMACIST", "ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const medicineId = "MED-" + require("crypto").randomBytes(3).toString("hex").toUpperCase();

    const newMed = await prisma.inventoryItem.create({
      data: {
        medicineId,
        medicineName: body.medicineName,
        category: body.category || "",
        stock: Number(body.quantity || body.stock || 0),
        price: Number(body.price) || 0,
        expiryDate: body.expiryDate || "",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        user: session.username,
        role: session.role,
        module: "PHARMACY",
        action: "ADD_MEDICINE",
        recordId: newMed.medicineId,
      },
    });

    return NextResponse.json(
      { message: "Medicine added", medicine: newMed },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to add medicine", error: error.message }, { status: 500 });
  }
}
