import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Robust project root detector that works under Passenger/Hostinger
function findProjectRoot(): string {
  // Check 1: Is package.json in process.cwd()?
  if (fs.existsSync(path.join(process.cwd(), "package.json"))) {
    return process.cwd();
  }
  
  // Check 2: Is package.json in process.cwd() + "/public_html"?
  const publicHtmlPath = path.join(process.cwd(), "public_html");
  if (fs.existsSync(path.join(publicHtmlPath, "package.json"))) {
    return publicHtmlPath;
  }
  
  // Check 3: Search upwards from __dirname
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
let absoluteDbUrl: string;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
  const filePath = process.env.DATABASE_URL.substring(5); // remove 'file:'
  const pathPart = filePath.split("?")[0];
  if (path.isAbsolute(pathPart)) {
    absoluteDbUrl = process.env.DATABASE_URL;
  } else {
    const resolvedPath = path.resolve(projectRoot, pathPart);
    const queryParams = filePath.substring(pathPart.length);
    absoluteDbUrl = `file:${resolvedPath}${queryParams}`;
  }
} else {
  absoluteDbUrl = `file:${path.resolve(projectRoot, "dev.db")}?connection_limit=1`;
}

// Force override process.env.DATABASE_URL so Prisma Client query engine uses the absolute path
process.env.DATABASE_URL = absoluteDbUrl;

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
      await prisma.$queryRawUnsafe(`PRAGMA busy_timeout = 10000;`);
    } catch (error) {
      // Catch errors silently during build or when database is not yet fully available
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to apply SQLite performance optimizations:", error);
      }
    }
  })();
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;





