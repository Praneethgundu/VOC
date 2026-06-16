import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, fee } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const dept = await prisma.department.create({
      data: {
        name,
        fee: fee !== undefined ? Number(fee) : 500,
      },
    });
    return NextResponse.json(dept);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Department already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
