import 'dotenv/config';
import { adminDb } from '../firebase/server-init';
import { AGENTS as defaultAgents } from '../agents-template';
import { CollectionReference } from 'firebase-admin/firestore';

// The AGENTS constant from your original `lib/agents.ts` file will be moved here.
// For brevity, it is omitted from this code block but should be pasted in.
// const defaultAgents = [ ... ];

async function seedAgents() {
    const agentsCollection = adminDb.collection('agents') as CollectionReference;
    const batch = adminDb.batch();
    let count = 0;

    console.log('Seeding agents...');
    for (const agent of defaultAgents) {
        const { icon, ...agentData } = agent;
        if (!icon || !icon.displayName) {
            console.warn(`Skipping agent "${agent.id}" due to missing icon displayName.`);
            continue;
        }
        const docRef = agentsCollection.doc(agent.id);
        batch.set(docRef, {
            ...agentData,
            icon: icon.displayName, // Store the icon's name as a string
            isDefault: true,
        });
        count++;
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${count} documents into the 'agents' collection.`);
}

seedAgents().catch(console.error);
