import 'dotenv/config';
import { CollectionReference } from 'firebase-admin/firestore';
import { AGENTS as defaultAgents } from './seed-data/agents-template';
import { adminDb } from '../firebase/server-init';

// The AGENTS constant from your original `lib/agents.ts` file will be moved here.
// For brevity, it is omitted from this code block but should be pasted in.
// const defaultAgents = [ ... ];

async function seedAgents() {
    const agentsCollection = adminDb.collection('agents') as CollectionReference;
    const batch = adminDb.batch();
    let count = 0;

    console.log('Seeding agents...');
    for (const agent of defaultAgents) {
        const { ...agentData } = agent as any;
        const docRef = agentsCollection.doc(agent.id);
        batch.set(docRef, {
            ...agentData
        });
        count++;
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${count} documents into the 'agents' collection.`);
}

seedAgents().catch(console.error);
