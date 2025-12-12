
// src/lib/db/seed-agent-categories.ts
import { adminDb } from '@/lib/firebase/server-init';
import { defaultAgentCategories } from './seed-data/agents';

async function seed() {
    console.log("Starting Agent Category seeding process...");
    const batch = adminDb.batch();

    try {
        console.log("Preparing to seed Agent Categories...");
        const agentCategoriesCollection = adminDb.collection('agent_categories');
        defaultAgentCategories.forEach(category => {
            const docRef = agentCategoriesCollection.doc(category.id);
            batch.set(docRef, category);
        });
        console.log(`${defaultAgentCategories.length} Agent Categories added to batch.`);

        await batch.commit();
        console.log("All agent categories have been successfully seeded to Firestore!");

    } catch (error) {
        console.error("Error during agent category seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Agent category seeding finished.");
    process.exit(0);
});
