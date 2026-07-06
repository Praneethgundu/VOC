import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: "admin" }
    });
    console.log("Found admin:", user);
    
    // Also check total users
    const count = await prisma.user.count();
    console.log("Total users:", count);
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
