const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Users:', await prisma.user.count());
  console.log('Patients:', await prisma.patient.count());
  console.log('Investigations:', await prisma.investigationMaster.count());
}
main().catch(console.error).finally(() => prisma.$disconnect());
