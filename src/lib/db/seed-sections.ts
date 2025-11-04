import { defaultSections } from '@/lib/db/seed-data/sections';
import { adminDb } from '@/lib/firebase/server-init';
const batch = adminDb.batch();
// --- Sections ---
console.log("Preparing to seed Sections...");
const sectionsCollection = adminDb.collection('sections');
defaultSections.forEach(section => {
    const { ...sectionData } = section;
    const docRef = sectionsCollection.doc(section.id);
    batch.set(docRef, { ...sectionData });
});
console.log(`${defaultSections.length} Sections added to batch.`);
