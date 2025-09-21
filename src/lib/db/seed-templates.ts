
// src/lib/db/seed-templates.ts
import { adminDb } from '@/lib/firebase/server-init';
import { templates as defaultDocxTemplates, type DocxTemplateKey  } from '@/lib/docx-styles';
import { templates as defaultPptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';

async function seed() {
    console.log("Starting template seeding process...");
    const batch = adminDb.batch();

    try {
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
        console.log("All templates have been successfully seeded to Firestore!");

    } catch (error) {
        console.error("Error during template seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
  console.log("Template seeding finished.");
  process.exit(0);
});

    
