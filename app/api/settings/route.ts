import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession, authorizeRole } from "@/utils/auth";
import { settingsSchema } from "@/lib/validations/schemas";
import { logAuditAction } from "@/lib/utils/auditLogger";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !authorizeRole(session, ["ADMIN", "RECEPTIONIST"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
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
    const validation = settingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: validation.data,
      create: { id: "default", ...validation.data },
    });

    await logAuditAction({
      req,
      user: session.username,
      role: session.role,
      module: "SETTINGS",
      action: "UPDATE_SYSTEM_SETTINGS",
      recordId: "default",
      status: "Success",
      details: "Updated email alerts settings",
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
