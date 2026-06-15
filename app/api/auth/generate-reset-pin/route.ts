import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole, hashPassword } from "@/utils/auth";
import { logAuditAction } from "@/lib/utils/auditLogger";
import { generatePinSchema } from "@/lib/validations/schemas";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validation = generatePinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
    }
    const { userId } = validation.data;

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

    // Strictly synchronous await
    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "AUTH",
      action: "GENERATE_PIN",
      recordId: userId,
      status: "Success",
      details: JSON.stringify({ action: "Generated Temporary PIN", expiry: expiry.toISOString() }),
    });

    return NextResponse.json({
      success: true,
      pin,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
