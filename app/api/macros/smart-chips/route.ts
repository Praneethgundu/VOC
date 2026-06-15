import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET(req: Request) {
  try {
    const chips = await prisma.smartChip.findMany();
    const smartChips: Record<string, { exam: string[], diagnosis: string[] }> = {};
    chips.forEach(c => {
      smartChips[c.chiefComplaint] = {
        exam: JSON.parse(c.examChips || "[]"),
        diagnosis: JSON.parse(c.diagnosisChips || "[]")
      };
    });
    return NextResponse.json(smartChips);
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching smart chips", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { chiefComplaint, examChips, diagnosisChips } = await req.json();
    if (!chiefComplaint) return NextResponse.json({ message: "Missing chiefComplaint" }, { status: 400 });

    const chip = await prisma.smartChip.upsert({
      where: { chiefComplaint },
      update: { 
        examChips: JSON.stringify(examChips || []),
        diagnosisChips: JSON.stringify(diagnosisChips || [])
      },
      create: { 
        chiefComplaint, 
        examChips: JSON.stringify(examChips || []),
        diagnosisChips: JSON.stringify(diagnosisChips || [])
      }
    });
    return NextResponse.json(chip);
  } catch (error: any) {
    return NextResponse.json({ message: "Error saving smart chip", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const complaint = searchParams.get("complaint");
    if (!complaint) return NextResponse.json({ message: "Missing complaint" }, { status: 400 });

    await prisma.smartChip.delete({ where: { chiefComplaint: complaint } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Error deleting smart chip", error: error.message }, { status: 500 });
  }
}
