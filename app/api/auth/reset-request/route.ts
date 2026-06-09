import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    // Stub logic: return success
    return NextResponse.json({ message: "Reset password request submitted successfully (stub)" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to request password reset", error: error.message }, { status: 500 });
  }
}
