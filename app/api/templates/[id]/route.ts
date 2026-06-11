import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.clinicalTemplate.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Template deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: "Error deleting template", error: error.message }, { status: 500 });
  }
}
