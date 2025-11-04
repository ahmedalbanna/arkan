
'use server';

import { AgentPromptSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';
import { getEnabledAgents } from '@/lib/db/queries';


// Schema for creating a new agent
const CreateAgentSchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required."),
    pageUrl: z.string().min(1, "Page URL is required").startsWith('/', "URL must start with /"),
    prompt: z.string(), // Prompt is now a direct string
    guidelines: z.array(z.string()).optional(), // Guidelines is a flat array of strings
    icon: z.string().optional(),
});

export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = CreateAgentSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...data } = validation.data;

        const agentRef = adminDb.collection('agents').doc(id);
        const doc = await agentRef.get();

        if (doc.exists) {
            return handleApiError({ message: 'An agent with this ID already exists.' }, 409);
        }

        await agentRef.set({ ...data, isEnabled: true, createdAt: new Date().toISOString() });

        const newAgent = await agentRef.get();
        return createApiResponse({ id: newAgent.id, ...newAgent.data() }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// GET all enabled agents
export const GET = withAuth(async ({ user }) => {
  try {
    const agents = await getEnabledAgents();
    return createApiResponse(agents, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
