import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const };
  cookieStore.delete({ name: "accessToken", ...options });
  cookieStore.delete({ name: "refreshToken", ...options });

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
