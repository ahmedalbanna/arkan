
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { AgentProperties, CreateAgentSchema, UpdateAgentSchema } from '@/lib/models';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const AGENTS_TAG = 'agents';
const AGENT_CATEGORIES_TAG = 'agent-categories';

// --- Agent Actions ---

export async function getAgentsAction(): Promise<AgentProperties[]> {
    const snapshot = await adminDb.collection('agents').orderBy('name').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgentProperties));
}

export async function createAgentAction(data: z.infer<typeof CreateAgentSchema>) {
    const validatedData = CreateAgentSchema.parse(data);
    const { id, ...agentData } = validatedData;
    const docRef = adminDb.collection('agents').doc(id);

    const doc = await docRef.get();
    if (doc.exists) {
        throw new Error('An agent with this ID already exists.');
    }

    const fullAgentData = {
        ...agentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    await docRef.set(fullAgentData);
    revalidateTag(AGENTS_TAG);
    return { id, ...fullAgentData } as AgentProperties;
}

export async function updateAgentAction(agentId: string, data: z.infer<typeof UpdateAgentSchema>) {
    const validatedData = UpdateAgentSchema.parse(data);
    const docRef = adminDb.collection('agents').doc(agentId);
    await docRef.update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
    });
    revalidateTag(AGENTS_TAG);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as AgentProperties;
}

export async function deleteAgentAction(agentId: string) {
    await adminDb.collection('agents').doc(agentId).delete();
    revalidateTag(AGENTS_TAG);
    return { message: 'Agent deleted successfully' };
}


// --- Agent Category Actions ---

export async function getAgentCategoriesAction() {
    const snapshot = await adminDb.collection('agent_categories').orderBy('name').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

const CreateCategorySchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
});

export async function createAgentCategoryAction(data: z.infer<typeof CreateCategorySchema>) {
    const validatedData = CreateCategorySchema.parse(data);
    const docRef = adminDb.collection('agent_categories').doc(validatedData.id);
    await docRef.set({ name: validatedData.name });
    revalidateTag(AGENT_CATEGORIES_TAG);
    return { id: validatedData.id, name: validatedData.name };
}
