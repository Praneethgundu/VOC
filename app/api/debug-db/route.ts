import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      env: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV
      },
      cwd: process.cwd(),
      dirname: __dirname
    }, { status: 500 });
  }
}
