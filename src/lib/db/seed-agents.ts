
// src/lib/db/seed-agents.ts
import { adminDb } from '@/lib/firebase/server-init';
import { defaultAgents } from './seed-data/agents';

async function seed() {
    console.log("Starting Agent seeding process...");
    const batch = adminDb.batch();

    try {
        console.log("Preparing to seed Agents...");
        const agentsCollection = adminDb.collection('agents');
        defaultAgents.forEach(agent => {
            const docRef = agentsCollection.doc(agent.id);
            const agentData = {
                ...agent,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            batch.set(docRef, agentData);
        });
        console.log(`${defaultAgents.length} Agents added to batch.`);

        await batch.commit();
        console.log("All agents have been successfully seeded to Firestore!");

    } catch (error) {
        console.error("Error during agent seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Agent seeding finished.");
    process.exit(0);
});
