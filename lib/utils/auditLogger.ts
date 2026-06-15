import { prisma } from "@/utils/db";

interface AuditLogOptions {
  req: Request;
  user?: string;
  role?: string;
  module: string;
  action: string;
  recordId: string;
  status?: "Success" | "Failure";
  patientId?: string;
  remarks?: string;
  details?: string;
}

export async function logAuditAction({
  req,
  user = "System",
  role = "Unknown",
  module,
  action,
  recordId,
  status = "Success",
  patientId,
  remarks,
  details,
}: AuditLogOptions) {
  try {
    const ipAddress = req.headers.get("x-forwarded-for") || "Unknown";

    await prisma.auditLog.create({
      data: {
        user,
        role,
        module,
        action,
        recordId,
        ipAddress,
        status,
        patientId,
        remarks,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
