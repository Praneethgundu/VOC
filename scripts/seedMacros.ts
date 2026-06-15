import { PrismaClient } from "@prisma/client";
import { DOT_PHRASES, SMART_CHIPS } from "../lib/clinicalMacros";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Dot Phrases...");
  for (const [shortcut, text] of Object.entries(DOT_PHRASES)) {
    await prisma.dotPhrase.upsert({
      where: { shortcut },
      update: { text },
      create: { shortcut, text }
    });
  }

  console.log("Seeding Smart Chips...");
  for (const [chiefComplaint, data] of Object.entries(SMART_CHIPS)) {
    await prisma.smartChip.upsert({
      where: { chiefComplaint },
      update: { 
        examChips: JSON.stringify(data.exam),
        diagnosisChips: JSON.stringify(data.diagnosis)
      },
      create: { 
        chiefComplaint, 
        examChips: JSON.stringify(data.exam),
        diagnosisChips: JSON.stringify(data.diagnosis)
      }
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
