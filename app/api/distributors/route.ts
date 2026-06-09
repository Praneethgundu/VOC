import { NextResponse } from "next/server";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const distributors = [
      { id: "dist_1", name: "Apex Pharma Distributors", contact: "+91 99887 76655", email: "orders@apexpharma.com", city: "Chennai" },
      { id: "dist_2", name: "Hindustan Medical Agencies", contact: "+91 91234 56789", email: "info@hma.co.in", city: "Madurai" },
      { id: "dist_3", name: "Sree Balaji Drug House", contact: "+91 94440 12345", email: "balajidrugs@gmail.com", city: "Coimbatore" },
    ];

    return NextResponse.json(distributors);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch distributors", error: error.message }, { status: 500 });
  }
}
