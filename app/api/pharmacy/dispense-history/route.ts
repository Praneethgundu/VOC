import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const history = await prisma.pharmacyDispense.findMany({
      orderBy: { dispensedDate: "desc" },
    });

    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch dispense history", error: error.message }, { status: 500 });
  }
}
