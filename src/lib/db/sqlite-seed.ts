import { db } from "@/infrastructure/db";
import { 
    settings, 
    sections, 
    agents, 
    agentCategories, 
    features, 
    templates 
} from "@/infrastructure/db/schema";
import { defaultBankAccounts } from '@/lib/db/seed-data/bank-accounts';
import { defaultPaymentMethods } from '@/lib/db/seed-data/payment-methods';
import { defaultFeatures } from '@/lib/db/seed-data/features';
import { defaultSections } from '@/lib/db/seed-data/sections';
import { defaultAgents, defaultAgentCategories } from './seed-data/agents';
import { defaultReportTemplates } from './seed-data/report-templates';
import { templates as defaultDocxTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { templates as defaultPptxTemplates } from '@/modules/templates/infrastructure/PptxStyles';

async function seed() {
    console.log("Starting SQLite seeding process...");

    try {
        // --- Settings ---
        console.log("Seeding default settings...");
        await db.insert(settings).values({
            key: 'defaults',
            value: JSON.stringify({
                newUserCredits: 10,
                bankAccounts: defaultBankAccounts,
                paymentMethods: defaultPaymentMethods
            })
        }).onConflictDoUpdate({
            target: settings.key,
            set: { value: JSON.stringify({
                newUserCredits: 10,
                bankAccounts: defaultBankAccounts,
                paymentMethods: defaultPaymentMethods
            })}
        });

        // --- Sections ---
        console.log("Seeding Sections...");
        for (const section of defaultSections) {
            await db.insert(sections).values({
                id: section.id!,
                title: section.title,
                type: (section.type as any) || 'report',
                prompt: section.prompt,
                guidelines: section.guidelines ? JSON.stringify(section.guidelines) : null,
                model: (section as any).model
            }).onConflictDoUpdate({
                target: sections.id,
                set: { 
                    title: section.title,
                    type: (section.type as any) || 'report',
                    prompt: section.prompt,
                    guidelines: section.guidelines ? JSON.stringify(section.guidelines) : null,
                    model: (section as any).model
                }
            });
        }

        // --- Agents ---
        console.log("Seeding Agents...");
        for (const agent of defaultAgents) {
            await db.insert(agents).values({
                id: agent.id,
                name: agent.name,
                description: agent.description,
                category: agent.category,
                prompt: agent.prompt,
                guidelines: agent.guidelines ? JSON.stringify(agent.guidelines) : null,
                isEnabled: agent.isEnabled ? true : false,
                author: agent.author,
                version: agent.version,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).onConflictDoUpdate({
                target: agents.id,
                set: {
                    name: agent.name,
                    description: agent.description,
                    category: agent.category,
                    prompt: agent.prompt,
                    guidelines: agent.guidelines ? JSON.stringify(agent.guidelines) : null,
                    isEnabled: agent.isEnabled ? true : false,
                    author: agent.author,
                    version: agent.version,
                    updatedAt: new Date().toISOString(),
                }
            });
        }

        // --- Agent Categories ---
        console.log("Seeding Agent Categories...");
        for (const category of defaultAgentCategories) {
            await db.insert(agentCategories).values({
                id: category.id,
                name: category.name,
                icon: category.icon,
                description: (category as any).description || null,
                order: (category as any).order || 0
            }).onConflictDoUpdate({
                target: agentCategories.id,
                set: {
                    name: category.name,
                    icon: category.icon,
                    description: (category as any).description || null,
                    order: (category as any).order || 0
                }
            });
        }

        // --- Features ---
        console.log("Seeding Features...");
        for (const feature of defaultFeatures) {
            await db.insert(features).values({
                id: feature.id,
                name: feature.name,
                description: feature.description,
                isEnabled: feature.isEnabled ? true : false,
                category: feature.category,
                updatedAt: new Date().toISOString(),
            }).onConflictDoUpdate({
                target: features.id,
                set: {
                    name: feature.name,
                    description: feature.description,
                    isEnabled: feature.isEnabled ? true : false,
                    category: feature.category,
                    updatedAt: new Date().toISOString(),
                }
            });
        }

        // --- DOCX Templates ---
        console.log("Seeding DOCX templates...");
        for (const key of Object.keys(defaultDocxTemplates)) {
            const template = (defaultDocxTemplates as any)[key];
            await db.insert(templates).values({
                id: key,
                type: 'docx',
                name: template.name || key,
                description: template.description || '',
                content: JSON.stringify(template),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).onConflictDoUpdate({
                target: templates.id,
                set: {
                    content: JSON.stringify(template),
                    updatedAt: new Date().toISOString(),
                }
            });
        }

        // --- PPTX Templates ---
        console.log("Seeding PPTX templates...");
        for (const key of Object.keys(defaultPptxTemplates)) {
            const template = (defaultPptxTemplates as any)[key];
            await db.insert(templates).values({
                id: key,
                type: 'pptx',
                name: template.name || key,
                description: template.description || '',
                content: JSON.stringify(template),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).onConflictDoUpdate({
                target: templates.id,
                set: {
                    content: JSON.stringify(template),
                    updatedAt: new Date().toISOString(),
                }
            });
        }

        // --- Report Generation Templates ---
        console.log("Seeding Report Generation templates...");
        for (const template of defaultReportTemplates) {
            await db.insert(templates).values({
                id: template.id,
                type: 'report',
                name: template.name,
                description: template.description,
                isDefault: !!(template as any).isDefault,
                content: JSON.stringify(template),
                projectType: (template as any).projectType,
                specialization: (template as any).specialization,
                university: (template as any).university,
                course: (template as any).course,
                educationalLevel: (template as any).educationalLevel,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).onConflictDoUpdate({
                target: templates.id,
                set: {
                    name: template.name,
                    description: template.description,
                    content: JSON.stringify(template),
                    updatedAt: new Date().toISOString(),
                }
            });
        }

        console.log("All configurations have been successfully seeded to SQLite!");

    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Seeding complete. Exiting.");
    process.exit(0);
});
