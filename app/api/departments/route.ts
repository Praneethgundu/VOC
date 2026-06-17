import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { z } from "zod";

const postSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fee: z.union([z.number(), z.string()]).optional().transform((val) => (val !== undefined ? Number(val) : undefined)),
});

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
    const parsedBody = postSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid input", details: parsedBody.error.format() }, { status: 400 });
    }

    const { name, fee } = parsedBody.data;

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
