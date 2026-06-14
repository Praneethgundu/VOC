import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyAccessToken, hashPassword } from "@/utils/auth";
import { logAuditAction } from "@/lib/utils/auditLogger";

export async function POST(req: Request) {
  try {
    const { resetToken, newPassword } = await req.json();

    if (!resetToken || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Invalid request. Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const payload = await verifyAccessToken(resetToken) as any;

    if (!payload || !payload.isResetToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset session. Please login with your PIN again." },
        { status: 401 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash: newPasswordHash },
    });

    await logAuditAction({
      req,
      user: payload.username,
      role: payload.role,
      module: "AUTH",
      action: "CHANGE_PASSWORD",
      recordId: payload.userId,
      status: "Success"
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now login with your new password.",
    });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
