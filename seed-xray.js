const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  const workbook = xlsx.readFile('Complete_XRay_Price_List (1).xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} records. Seeding database...`);

  let count = 0;
  for (const row of data) {
    const name = row['X-Ray Description'];
    const priceStr = row['Price (₹)'];
    const sno = row['S.No'];
    
    if (!name || priceStr === undefined) continue;

    // Convert price to number, remove any non-numeric characters just in case
    const price = typeof priceStr === 'number' ? priceStr : parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));

    // Generate a unique code
    const code = `XR-${String(sno).padStart(3, '0')}`;

    await prisma.investigationMaster.upsert({
      where: { code },
      update: {
        name,
        price,
        category: 'X-Ray',
        type: 'Investigation'
      },
      create: {
        code,
        name,
        price,
        category: 'X-Ray',
        type: 'Investigation'
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} X-Ray investigations!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
