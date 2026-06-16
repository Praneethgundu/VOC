import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";
import { departmentSchema } from "@/lib/validations/schemas";
import { logAuditAction } from "@/lib/utils/auditLogger";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const depts = await prisma.department.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json(depts);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validation = departmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const dept = await prisma.department.create({
      data: validation.data,
    });

    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "SETTINGS",
      action: "CREATE_DEPARTMENT",
      recordId: dept.id,
      status: "Success",
      details: `Created department ${dept.name}`,
    });

    return NextResponse.json(dept);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
