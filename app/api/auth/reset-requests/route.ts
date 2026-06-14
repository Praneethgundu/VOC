import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const requests = await prisma.user.findMany({
      where: { resetRequested: true },
      select: { id: true, username: true, role: true, updatedAt: true },
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
