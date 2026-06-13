import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/utils/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

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

    cookieStore.set("accessToken", newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 8 * 60 * 60 });
    cookieStore.set("refreshToken", newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
