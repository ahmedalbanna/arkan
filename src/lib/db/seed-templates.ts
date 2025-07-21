
// src/lib/db/seed-templates.ts
import { adminDb } from '@/lib/firebase/admin';
import { PROPOSAL_TEMPLATES } from '@/lib/proposal-templates';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { PRESENTATION_GENERATION_TEMPLATES } from '@/lib/presentation-generation-templates';
import { templates as docxTemplates, type TemplateKey as DocxTemplateKey } from '@/lib/docx-styles';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';

async function seedTemplates() {
  console.log('Starting to seed all templates into Firestore...');

  const templatesRef = adminDb.collection('templates');

  try {
    // Seed Proposal Templates
    const proposalBatch = adminDb.batch();
    const proposalCollection = templatesRef.doc('proposal').collection('items');
    console.log(`Seeding ${PROPOSAL_TEMPLATES.length} proposal templates...`);
    PROPOSAL_TEMPLATES.forEach(template => {
      const docRef = proposalCollection.doc(template.id);
      proposalBatch.set(docRef, template);
    });
    await proposalBatch.commit();
    console.log('Proposal templates seeded successfully.');

    // Seed Report Templates
    const reportBatch = adminDb.batch();
    const reportCollection = templatesRef.doc('report').collection('items');
    console.log(`Seeding ${REPORT_GENERATION_TEMPLATES.length} report templates...`);
    REPORT_GENERATION_TEMPLATES.forEach(template => {
      const docRef = reportCollection.doc(template.id);
      reportBatch.set(docRef, template);
    });
    await reportBatch.commit();
    console.log('Report templates seeded successfully.');

    // Seed Presentation Templates
    const presentationBatch = adminDb.batch();
    const presentationCollection = templatesRef.doc('presentation').collection('items');
    console.log(`Seeding ${PRESENTATION_GENERATION_TEMPLATES.length} presentation templates...`);
    PRESENTATION_GENERATION_TEMPLATES.forEach(template => {
        const docRef = presentationCollection.doc(template.id);
        presentationBatch.set(docRef, template);
    });
    await presentationBatch.commit();
    console.log('Presentation templates seeded successfully.');

    // Seed DOCX Style Templates
    const docxBatch = adminDb.batch();
    const docxCollection = templatesRef.doc('docx').collection('styles');
    console.log(`Seeding ${Object.keys(docxTemplates).length} DOCX style templates...`);
    (Object.keys(docxTemplates) as DocxTemplateKey[]).forEach(key => {
        const template = docxTemplates[key];
        const docRef = docxCollection.doc(key);
        docxBatch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
    });
    await docxBatch.commit();
    console.log('DOCX style templates seeded successfully.');

    // Seed PPTX Style Templates
    const pptxBatch = adminDb.batch();
    const pptxCollection = templatesRef.doc('pptx').collection('styles');
    console.log(`Seeding ${Object.keys(pptxTemplates).length} PPTX style templates...`);
    (Object.keys(pptxTemplates) as PptxTemplateKey[]).forEach(key => {
        const template = pptxTemplates[key];
        const docRef = pptxCollection.doc(key);
        pptxBatch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
    });
    await pptxBatch.commit();
    console.log('PPTX style templates seeded successfully.');


    console.log('All templates have been seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
