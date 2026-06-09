import { NextResponse } from "next/server";
import { getSession } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const alerts = [
      {
        id: "sys_status",
        type: "success",
        module: "System",
        title: "All Systems Operational",
        message: "VOC Orthopaedic Hospital Management System is running normally.",
        timestamp: new Date().toISOString(),
      },
      {
        id: "backup_alert",
        type: "info",
        module: "Database",
        title: "Daily Backup Status",
        message: "Your last automatic backup was generated successfully.",
        timestamp: new Date().toISOString(),
      }
    ];

    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch alerts", error: error.message }, { status: 500 });
  }
}
