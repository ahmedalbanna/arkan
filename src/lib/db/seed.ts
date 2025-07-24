
// src/lib/db/seed.ts
//require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
import { adminDb } from '@/lib/firebase/admin';
import { AGENTS as defaultAgents } from '@/lib/agents';
import { defaultFeatures } from '@/lib/features';
import { templates as defaultDocxTemplates, type TemplateKey as DocxTemplateKey } from '@/lib/docx-styles';
import { templates as defaultPptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { PROPOSAL_TEMPLATES as defaultProposalTemplates } from '@/lib/proposal-templates';
import { REPORT_GENERATION_TEMPLATES as defaultReportTemplates } from '@/lib/report-generation-templates';
import { PRESENTATION_GENERATION_TEMPLATES as defaultPresentationTemplates } from '@/lib/presentation-generation-templates';

async function seed() {
    console.log("Starting Firestore seeding process...");
    const batch = adminDb.batch();

    try {
        // --- Agents ---
        console.log("Preparing to seed Agents...");
        const agentsCollection = adminDb.collection('agents');
        defaultAgents.forEach(agent => {
            const { icon, ...agentData } = agent;
            const docRef = agentsCollection.doc(agent.id);
            batch.set(docRef, agentData);
        });
        console.log(`${defaultAgents.length} Agents added to batch.`);

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
        
        // --- Proposal Templates ---
        console.log("Preparing to seed Proposal templates...");
        const proposalCollection = adminDb.collection('templates').doc('proposal').collection('items');
        defaultProposalTemplates.forEach(template => {
            const docRef = proposalCollection.doc(template.id);
            batch.set(docRef, template);
        });
        console.log(`${defaultProposalTemplates.length} Proposal templates added to batch.`);

        // --- Report Templates ---
        console.log("Preparing to seed Report templates...");
        const reportCollection = adminDb.collection('templates').doc('report').collection('items');
        defaultReportTemplates.forEach(template => {
            const docRef = reportCollection.doc(template.id);
            batch.set(docRef, template);
        });
        console.log(`${defaultReportTemplates.length} Report templates added to batch.`);

        // --- Presentation Templates ---
        console.log("Preparing to seed Presentation templates...");
        const presentationCollection = adminDb.collection('templates').doc('presentation').collection('items');
        defaultPresentationTemplates.forEach(template => {
            const docRef = presentationCollection.doc(template.id);
            batch.set(docRef, template);
        });
        console.log(`${defaultPresentationTemplates.length} Presentation templates added to batch.`);

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
