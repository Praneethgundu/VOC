import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole, hashPassword } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Generate 6 digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = await hashPassword(pin);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: userId },
      data: {
        resetRequested: false,
        resetPinHash: pinHash,
        resetPinExpiry: expiry,
      },
    });

    return NextResponse.json({
      success: true,
      pin,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
