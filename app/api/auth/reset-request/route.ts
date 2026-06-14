import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // Return success even if user not found to prevent user enumeration
      return NextResponse.json({ success: true, message: "Reset requested successfully." });
    }

    await prisma.user.update({
      where: { username },
      data: { resetRequested: true },
    });

    return NextResponse.json({
      success: true,
      message: "Reset requested successfully. Please ask the administrator for your temporary PIN.",
    });
  } catch (error: any) {
    console.error("Reset request error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
