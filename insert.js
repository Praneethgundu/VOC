const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.consultation.create({
    data: {
      patientId: "9b25ce00-083d-4fb1-8f9a-5673f03d4062",
      opNumber: "OP-2026-1951",
      doctor: "Dr. H. Vinay Kumar",
      department: "Orthopaedics",
      status: "Waiting",
      consultationDate: new Date("2026-07-16T00:00:00Z")
    }
  });
  console.log(c);
}
main().catch(console.error).finally(() => prisma.$disconnect());
