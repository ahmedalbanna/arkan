import { templates as defaultDocxTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import prisma from '@/lib/db/prisma';
import { templates as defaultPptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';

async function seed() {
    console.log("Starting template seeding process...");

    try {
        // --- DOCX Templates ---
        console.log("Preparing to seed DOCX templates...");
        for (const key of Object.keys(defaultDocxTemplates) as DocxTemplateKey[]) {
            const template = defaultDocxTemplates[key];
            await prisma.docxTemplate.upsert({
                where: { id: key },
                update: {
                    ...template,
                },
                create: {
                    id: key,
                    ...template,
                },
            });
        }
        console.log(`${Object.keys(defaultDocxTemplates).length} DOCX templates seeded successfully.`);

        // --- PPTX Templates ---
        console.log("Preparing to seed PPTX templates...");
        for (const key of Object.keys(defaultPptxTemplates) as PptxTemplateKey[]) {
            const template = defaultPptxTemplates[key];
            await prisma.pptxTemplate.upsert({
                where: { id: key },
                update: {
                    ...template,
                },
                create: {
                    id: key,
                    ...template,
                },
            });
        }
        console.log(`${Object.keys(defaultPptxTemplates).length} PPTX templates seeded successfully.`);

        console.log("All templates have been successfully seeded to PostgreSQL!");

    } catch (error) {
        console.error("Error during template seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Template seeding finished.");
    process.exit(0);
}).catch((error) => {
    console.error("Template seeding error:", error);
    process.exit(1);
});

