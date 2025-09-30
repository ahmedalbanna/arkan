'use server';

import { AgentPromptSchema } from '@/ai/schemas';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';


// Schema for creating a new agent
const CreateAgentSchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required."),
    pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
    prompt: z.union([z.string(), AgentPromptSchema]),
    icon: z.string().optional(),
});

export const POST = withEnhancedAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = CreateAgentSchema.safeParse(body);

        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error);
        }

        const { id, ...data } = validation.data;

        const agentRef = adminDb.collection('agents').doc(id);
        const doc = await agentRef.get();

        if (doc.exists) {
            return handleApiErrorEnhanced({ message: 'An agent with this ID already exists.' }, 409);
        }

        await agentRef.set({ ...data, isEnabled: true, createdAt: new Date().toISOString() });

        const newAgent = await agentRef.get();
        return createApiResponseEnhanced({ id: newAgent.id, ...newAgent.data() }, 201);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
