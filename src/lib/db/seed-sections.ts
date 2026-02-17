import { defaultSections } from '@/lib/db/seed-data/sections';
import prisma from '@/lib/db/prisma';

async function seed() {
  // --- Sections ---
  console.log("Preparing to seed Sections...");
  
  for (const section of defaultSections) {
    await prisma.section.upsert({
      where: { id: section.id || 'unknown' },
      update: {
        title: section.title,
        type: section.type,
        prompt: section.prompt,
        guidelines: section.guidelines || [],
        model: section.model,
      },
      create: {
        id: section.id || 'unknown',
        title: section.title,
        type: section.type,
        prompt: section.prompt,
        guidelines: section.guidelines || [],
        model: section.model,
      },
    });
  }
  console.log(`${defaultSections.length} Sections seeded successfully.`);
}

seed().then(() => {
  console.log("Section seeding complete.");
  process.exit(0);
}).catch((error) => {
  console.error("Section seeding error:", error);
  process.exit(1);
});
