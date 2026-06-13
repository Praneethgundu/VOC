import { PrismaClient } from "@prisma/client";
import path from "path";

// Ensure DATABASE_URL is set correctly for runtime
if (!process.env.DATABASE_URL) {
  // Default to dev.db at the project root
  const dbPath = path.resolve(process.cwd(), "dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
} else if (process.env.DATABASE_URL.startsWith("file:")) {
  const filePath = process.env.DATABASE_URL.substring(5); // remove 'file:'
  if (!path.isAbsolute(filePath)) {
    // Resolve relative paths to the project root (process.cwd()) where dev.db is located
    const fileName = path.basename(filePath);
    const dbPath = path.resolve(process.cwd(), fileName);
    process.env.DATABASE_URL = `file:${dbPath}`;
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
