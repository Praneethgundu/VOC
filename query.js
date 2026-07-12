const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.consultation.findMany().then(c => console.log(JSON.stringify(c, null, 2))).catch(console.error).finally(() => prisma.$disconnect());
