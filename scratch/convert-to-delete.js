const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Converting database journal_mode to DELETE...");
  const result = await prisma.$queryRawUnsafe("PRAGMA journal_mode = DELETE;");
  console.log("Result:", result);
  
  const current = await prisma.$queryRawUnsafe("PRAGMA journal_mode;");
  console.log("New journal mode:", current);
}

main().catch(console.error).finally(() => prisma.$disconnect());
