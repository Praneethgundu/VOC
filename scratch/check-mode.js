const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.$queryRawUnsafe("PRAGMA journal_mode;");
  console.log("Current journal mode:", result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
