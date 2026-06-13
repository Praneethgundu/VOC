import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Robust project root detector that works under Passenger/Hostinger
function findProjectRoot(): string {
  const startDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
  let currentDir = startDir;
  
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  return process.cwd();
}

const projectRoot = findProjectRoot();
const dbPath = path.resolve(projectRoot, "dev.db");
const absoluteDbUrl = `file:${dbPath}?connection_limit=1`;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: absoluteDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Optimize SQLite for concurrent read/write and reliability under load
if (absoluteDbUrl.startsWith("file:")) {
  (async () => {
    try {
      await prisma.$queryRawUnsafe(`PRAGMA journal_mode = WAL;`);
      await prisma.$queryRawUnsafe(`PRAGMA busy_timeout = 10000;`);
      await prisma.$queryRawUnsafe(`PRAGMA synchronous = NORMAL;`);
    } catch (error) {
      // Catch errors silently during build or when database is not yet fully available
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to apply SQLite performance optimizations:", error);
      }
    }
  })();
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


