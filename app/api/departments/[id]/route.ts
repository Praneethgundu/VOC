import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";
import { departmentSchema } from "@/lib/validations/schemas";
import { logAuditAction } from "@/lib/utils/auditLogger";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session || !authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = departmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const dept = await prisma.department.update({
      where: { id },
      data: validation.data,
    });

    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "SETTINGS",
      action: "UPDATE_DEPARTMENT",
      recordId: dept.id,
      status: "Success",
    });

    return NextResponse.json(dept);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session || !authorizeRole(session, ["ADMIN"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const dept = await prisma.department.delete({
      where: { id },
    });

    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "SETTINGS",
      action: "DELETE_DEPARTMENT",
      recordId: dept.id,
      status: "Success",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
