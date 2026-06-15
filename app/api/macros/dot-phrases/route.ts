import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET(req: Request) {
  try {
    const phrases = await prisma.dotPhrase.findMany();
    // Convert array of {shortcut: string, text: string} to object Record<string, string>
    const dotPhrases: Record<string, string> = {};
    phrases.forEach(p => {
      dotPhrases[p.shortcut] = p.text;
    });
    return NextResponse.json(dotPhrases);
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching dot phrases", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { shortcut, text } = await req.json();
    if (!shortcut || !text) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const phrase = await prisma.dotPhrase.upsert({
      where: { shortcut },
      update: { text },
      create: { shortcut, text }
    });
    return NextResponse.json(phrase);
  } catch (error: any) {
    return NextResponse.json({ message: "Error saving dot phrase", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shortcut = searchParams.get("shortcut");
    if (!shortcut) return NextResponse.json({ message: "Missing shortcut" }, { status: 400 });

    await prisma.dotPhrase.delete({ where: { shortcut } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Error deleting dot phrase", error: error.message }, { status: 500 });
  }
}
