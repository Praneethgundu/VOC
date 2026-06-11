import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const complaint = searchParams.get("complaint");

    if (complaint) {
      const template = await prisma.clinicalTemplate.findUnique({
        where: { chiefComplaint: complaint },
      });
      return NextResponse.json(template || { templateText: "" });
    }

    const templates = await prisma.clinicalTemplate.findMany();
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching templates", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chiefComplaint, templateText } = body;

    if (!chiefComplaint || !templateText) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const template = await prisma.clinicalTemplate.upsert({
      where: { chiefComplaint },
      update: { templateText },
      create: { chiefComplaint, templateText },
    });

    return NextResponse.json({ message: "Template saved", template });
  } catch (error: any) {
    return NextResponse.json({ message: "Error saving template", error: error.message }, { status: 500 });
  }
}
