import { defaultBankAccounts } from '@/lib/db/seed-data/bank-accounts';
import { defaultFeatures } from '@/lib/db/seed-data/features';
import { defaultSections } from '@/lib/db/seed-data/sections';
import { templates as defaultDocxTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import prisma from '@/lib/db/prisma';
import { templates as defaultPptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { defaultAgents, defaultAgentCategories } from './seed-data/agents';
import { defaultReportTemplates } from './seed-data/report-templates';

async function seed() {
    console.log("Starting PostgreSQL seeding process...");

    try {
        // --- Settings ---
        console.log("Preparing to seed default settings...");
        await prisma.setting.upsert({
            where: { key: 'defaults' },
            update: {
                value: {
                    newUserCredits: 10,
                    bankAccounts: defaultBankAccounts
                }
            },
            create: {
                key: 'defaults',
                value: {
                    newUserCredits: 10,
                    bankAccounts: defaultBankAccounts
                }
            }
        });
        console.log("Default settings seeded successfully.");

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

        // --- Agents ---
        console.log("Preparing to seed Agents...");
        for (const agent of defaultAgents) {
            await prisma.agent.upsert({
                where: { id: agent.id },
                update: { ...agent },
                create: { ...agent },
            });
        }
        console.log(`${defaultAgents.length} Agents seeded successfully.`);

        // --- Agent Categories ---
        console.log("Preparing to seed Agent Categories...");
        for (const category of defaultAgentCategories) {
            await prisma.agentCategory.upsert({
                where: { id: category.id },
                update: { ...category },
                create: { ...category },
            });
        }
        console.log(`${defaultAgentCategories.length} Agent Categories seeded successfully.`);

        // --- Features ---
        console.log("Preparing to seed Features...");
        for (const feature of defaultFeatures) {
            await prisma.feature.upsert({
                where: { id: feature.id },
                update: { ...feature },
                create: { ...feature },
            });
        }
        console.log(`${defaultFeatures.length} Features seeded successfully.`);

        // --- DOCX Templates ---
        console.log("Preparing to seed DOCX templates...");
        for (const key of Object.keys(defaultDocxTemplates) as DocxTemplateKey[]) {
            const template = defaultDocxTemplates[key];
            await prisma.docxTemplate.upsert({
                where: { id: key },
                update: { ...template },
                create: { id: key, ...template },
            });
        }
        console.log(`${Object.keys(defaultDocxTemplates).length} DOCX templates seeded successfully.`);

        // --- PPTX Templates ---
        console.log("Preparing to seed PPTX templates...");
        for (const key of Object.keys(defaultPptxTemplates) as PptxTemplateKey[]) {
            const template = defaultPptxTemplates[key];
            await prisma.pptxTemplate.upsert({
                where: { id: key },
                update: { ...template },
                create: { id: key, ...template },
            });
        }
        console.log(`${Object.keys(defaultPptxTemplates).length} PPTX templates seeded successfully.`);

        // --- Report Generation Templates ---
        console.log("Preparing to seed Report Generation templates...");
        for (const template of defaultReportTemplates) {
            const { sectionIds, ...restOfTemplate } = template as any;
            const templateData = { ...restOfTemplate };
            if (sectionIds) {
                console.warn(`Template "${template.id}" uses old 'sectionIds' format. Converting...`);
            }
            await prisma.reportTemplate.upsert({
                where: { id: template.id },
                update: templateData,
                create: { ...templateData },
            });
        }
        console.log(`${defaultReportTemplates.length} Report Generation templates seeded successfully.`);

        console.log("All configurations have been successfully seeded to PostgreSQL!");

    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Seeding complete. Exiting.");
    process.exit(0);
}).catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
});
