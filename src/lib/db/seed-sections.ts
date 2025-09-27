import 'dotenv/config'; // Make sure to install dotenv: npm install dotenv
import { adminDb } from '../firebase/server-init';
import { reportSections, diagramSections, presentationSections } from './seed-data/sections-templates';
import { CollectionReference } from 'firebase-admin/firestore';

// A helper type to make sure our section objects are what we expect
interface StaticSection {
    title: string;
    agentId: string;
}

async function seedSections() {
    const sectionsCollection = adminDb.collection('sections') as CollectionReference;
    const batch = adminDb.batch();
    let count = 0;

    console.log('Seeding report sections...');
    for (const [id, section] of Object.entries(reportSections)) {
        const staticSection = section as StaticSection;
        const docRef = sectionsCollection.doc(id);
        batch.set(docRef, {
            title: staticSection.title,
            agentId: staticSection.agentId,
            type: 'report'
        });
        count++;
    }

    console.log('Seeding diagram sections...');
    for (const [id, section] of Object.entries(diagramSections)) {
        const staticSection = section as StaticSection;
        const docRef = sectionsCollection.doc(id);
        batch.set(docRef, {
            title: staticSection.title,
            agentId: staticSection.agentId,
            type: 'diagram'
        });
        count++;
    }

    console.log('Seeding presentation section...');
    const staticPresentationSection = presentationSections as StaticSection;
    const docRef = sectionsCollection.doc('presentation');
    batch.set(docRef, {
        title: staticPresentationSection.title,
        agentId: staticPresentationSection.agentId,
        type: 'presentation'
    });
    count++;


    await batch.commit();
    console.log(`✅ Successfully seeded ${count} documents into the 'sections' collection.`);
}

seedSections().catch(console.error);
