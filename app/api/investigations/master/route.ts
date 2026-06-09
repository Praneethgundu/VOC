import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const master = await prisma.investigationMaster.findMany();
    return NextResponse.json(master);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch investigation master data", error: error.message }, { status: 500 });
  }
}
