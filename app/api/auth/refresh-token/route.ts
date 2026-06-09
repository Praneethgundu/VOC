import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token is required" }, { status: 401 });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: decoded.username },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ message: "User account is invalid or disabled" }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(payload);

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
