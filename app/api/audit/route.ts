import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch audit logs", error: error.message }, { status: 500 });
  }
}
