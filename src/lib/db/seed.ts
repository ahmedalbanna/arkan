
// src/lib/db/seed.ts
//require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
import { adminDb } from '@/lib/firebase/server-init';
import { AGENTS as defaultAgents } from '@/lib/db/seed-data/agents-template';
import { defaultFeatures } from '@/lib/db/seed-data/features';
import { defaultAgentCategories } from '@/lib/db/seed-data/agent-categories';
import { defaultSections } from '@/lib/db/seed-data/sections';
import { templates as defaultDocxTemplates, type DocxTemplateKey  } from '@/lib/docx-styles';
import { templates as defaultPptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { defaultBankAccounts } from '@/lib/db/seed-data/bank-accounts';

async function seed() {
    console.log("Starting Firestore seeding process...");
    const batch = adminDb.batch();

    try {
        // --- Settings ---
        console.log("Preparing to seed default settings...");
        const settingsRef = adminDb.collection('settings').doc('defaults');
        batch.set(settingsRef, {
            newUserCredits: 10,
            bankAccounts: defaultBankAccounts
        });
        console.log("Default settings added to batch.");

        // --- Agent Categories ---
        console.log("Preparing to seed Agent Categories...");
        const categoriesCollection = adminDb.collection('agent_categories');
        defaultAgentCategories.forEach(category => {
            const docRef = categoriesCollection.doc(category.id);
            batch.set(docRef, { name: category.name });
        });
        console.log(`${defaultAgentCategories.length} Agent Categories added to batch.`);

        // --- Agents ---
        console.log("Preparing to seed Agents...");
        const agentsCollection = adminDb.collection('agents');
        defaultAgents.forEach(agent => {
            const { ...agentData } = agent;
            const docRef = agentsCollection.doc(agent.id);
            batch.set(docRef, agentData);
        });
        console.log(`${defaultAgents.length} Agents added to batch.`);

        // --- Sections ---
        console.log("Preparing to seed Sections...");
        const sectionsCollection = adminDb.collection('sections');
        defaultSections.forEach(section => {
            const { ...sectionData } = section;
            const docRef = sectionsCollection.doc(section.id);
            batch.set(docRef, { ...sectionData });
        });
        console.log(`${defaultSections.length} Sections added to batch.`);

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
