
// src/lib/db/seed.ts
import { defaultBankAccounts } from '@/lib/db/seed-data/bank-accounts';
import { defaultPaymentMethods } from '@/lib/db/seed-data/payment-methods';
import { defaultFeatures } from '@/lib/db/seed-data/features';
import { defaultSections } from '@/lib/db/seed-data/sections';

import { adminDb } from '@/infrastructure/firebase/server-init';
import { PptxTemplateKey, templates as defaultPptxTemplates } from '@/modules/templates/infrastructure/PptxStyles';
import { defaultAgents, defaultAgentCategories } from './seed-data/agents';
import { defaultReportTemplates } from './seed-data/report-templates';
import { DocxTemplateKey, templates as defaultDocxTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';

async function seed() {
    console.log("Starting Firestore seeding process...");
    const batch = adminDb.batch();

    try {
        // --- Settings ---
        console.log("Preparing to seed default settings...");
        const settingsRef = adminDb.collection('settings').doc('defaults');
        batch.set(settingsRef, {
            newUserCredits: 10,
            bankAccounts: defaultBankAccounts,
            paymentMethods: defaultPaymentMethods
        });
        console.log("Default settings added to batch.");

        // --- Sections ---
        console.log("Preparing to seed Sections...");
        const sectionsCollection = adminDb.collection('sections');
        defaultSections.forEach(section => {
            const { ...sectionData } = section;
            const docRef = sectionsCollection.doc(section.id || 'unknown');
            batch.set(docRef, { ...sectionData });
        });
        console.log(`${defaultSections.length} Sections added to batch.`);

        // --- Agents ---
        console.log("Preparing to seed Agents...");
        const agentsCollection = adminDb.collection('agents');
        defaultAgents.forEach(agent => {
            const docRef = agentsCollection.doc(agent.id);
            batch.set(docRef, agent);
        });
        console.log(`${defaultAgents.length} Agents added to batch.`);

        // --- Agent Categories ---
        console.log("Preparing to seed Agent Categories...");
        const agentCategoriesCollection = adminDb.collection('agent_categories');
        defaultAgentCategories.forEach(category => {
            const docRef = agentCategoriesCollection.doc(category.id);
            batch.set(docRef, category);
        });
        console.log(`${defaultAgentCategories.length} Agent Categories added to batch.`);

        // --- Features ---
        console.log("Preparing to seed Features...");
        const featuresCollection = adminDb.collection('features');
        defaultFeatures.forEach(feature => {
            const docRef = featuresCollection.doc(feature.id);
            batch.set(docRef, feature);
        });
        console.log(`${defaultFeatures.length} Features added to batch.`);

        // --- DOCX Templates ---
        console.log("Preparing to seed DOCX templates...");
        const docxCollection = adminDb.collection('templates').doc('docx').collection('styles');
        (Object.keys(defaultDocxTemplates) as DocxTemplateKey[]).forEach(key => {
            const template = defaultDocxTemplates[key];
            const docRef = docxCollection.doc(key);
            batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
        });
        console.log(`${Object.keys(defaultDocxTemplates).length} DOCX templates added to batch.`);

        // --- PPTX Templates ---
        console.log("Preparing to seed PPTX templates...");
        const pptxCollection = adminDb.collection('templates').doc('pptx').collection('styles');
        (Object.keys(defaultPptxTemplates) as PptxTemplateKey[]).forEach(key => {
            const template = defaultPptxTemplates[key];
            const docRef = pptxCollection.doc(key);
            batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
        });
        console.log(`${Object.keys(defaultPptxTemplates).length} PPTX templates added to batch.`);

        // --- Report Generation Templates ---
        console.log("Preparing to seed Report Generation templates...");
        const reportTemplateCollection = adminDb.collection('templates').doc('report').collection('items');
        defaultReportTemplates.forEach(template => {
            const docRef = reportTemplateCollection.doc(template.id);
            // The new structure has `content` which holds chapters and sections
            const { sectionIds, ...restOfTemplate } = template as any; // Cast to any to handle old structure
            const templateData = { ...restOfTemplate };
             if (sectionIds) {
                // This logic can be removed if the old structure is fully deprecated.
                // It's here for backward compatibility during transition.
                console.warn(`Template "${template.id}" uses old 'sectionIds' format. Converting...`);
            }
            batch.set(docRef, templateData);
        });
        console.log(`${defaultReportTemplates.length} Report Generation templates added to batch.`);


        // Commit all changes at once
        await batch.commit();
        console.log("All configurations have been successfully seeded to Firestore!");

    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Seeding complete. Exiting.");
    process.exit(0);
});
