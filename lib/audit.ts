import { prisma } from "./prisma";

export async function logAudit({
  user,
  role,
  module,
  action,
  recordId,
}: {
  user: string;
  role: string;
  module: string;
  action: string;
  recordId: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        user,
        role,
        module,
        action,
        recordId,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
