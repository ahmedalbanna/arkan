// src/lib/db/seed-agent-categories.ts
import { adminDb } from '@/lib/firebase/server-init';
import { defaultAgentCategories } from '@/lib/db/seed-data/agent-categories';

async function seed() {
    console.log("Starting agent category seeding process...");
    const batch = adminDb.batch();

    try {
        // --- Agent Categories ---
        console.log("Preparing to seed Agent Categories...");
        const categoriesCollection = adminDb.collection('agent_categories');
        defaultAgentCategories.forEach(category => {
            const docRef = categoriesCollection.doc(category.id);
            batch.set(docRef, { name: category.name });
        });
        console.log(`${defaultAgentCategories.length} Agent Categories added to batch.`);

        // Commit all changes at once
        await batch.commit();
        console.log("All agent categories have been successfully seeded to Firestore!");

    } catch (error) {
        console.error("Error during agent category seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Category seeding complete. Exiting.");
    process.exit(0);
});
