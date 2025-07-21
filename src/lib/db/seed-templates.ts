
// src/lib/db/seed-templates.ts
import { adminDb } from '@/lib/firebase/admin';
import { PROPOSAL_TEMPLATES } from '@/lib/proposal-templates';
import { REPORT_GENERATION_TEMPLATES } from '@/lib/report-generation-templates';
import { PRESENTATION_GENERATION_TEMPLATES } from '@/lib/presentation-generation-templates';

async function seedTemplates() {
  console.log('Starting to seed generation templates into Firestore...');

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


    console.log('All templates have been seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
