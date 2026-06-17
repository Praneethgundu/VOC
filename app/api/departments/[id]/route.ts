import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { z } from "zod";

const putSchema = z.object({
  name: z.string().optional(),
  fee: z.union([z.number(), z.string()]).optional().transform((val) => (val !== undefined ? Number(val) : undefined)),
  isActive: z.union([z.boolean(), z.string()]).optional().transform((val) => (val !== undefined ? Boolean(val) : undefined)),
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const parsedBody = putSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid input", details: parsedBody.error.format() }, { status: 400 });
    }
    
    const dept = await prisma.department.update({
      where: { id },
      data: {
        name: parsedBody.data.name,
        fee: parsedBody.data.fee,
        isActive: parsedBody.data.isActive,
      },
    });
    return NextResponse.json(dept);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
