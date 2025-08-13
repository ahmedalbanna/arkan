// src/app/api/agents/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { AGENTS as defaultAgents, AgentCategory, type AgentKnowledgeSource } from '@/lib/agents';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { AgentPromptSchema } from '@/ai/schemas/template-schemas';

// GET /api/agents
export const GET = withAuth(async () => {
    try {
        const agentsCollection = adminDb.collection('agents');
        let snapshot = await agentsCollection.get();

        // Lazy seeding: If no agents exist, populate them from the default config.
        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultAgents.forEach(agent => {
                const docRef = agentsCollection.doc(agent.id);
                // We only store data that can be modified, not the icon or other static parts.
                const { icon, ...agentData } = agent;
                batch.set(docRef, agentData);
            });
            await batch.commit();
            snapshot = await agentsCollection.get(); // Re-fetch after seeding
        }
        
        const agents = snapshot.docs.map(doc => {
            const data = doc.data();
            // Re-hydrate with the icon from the default config
            const defaultAgent = defaultAgents.find(a => a.id === doc.id);
            return {
                ...data,
                id: doc.id,
                icon: defaultAgent?.icon,
            };
        });

        return createApiResponse(agents, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


const agentKnowledgeSourceSchema = z.object({
    name: z.string(),
    type: z.enum(['file', 'text', 'web']),
    content: z.string(),
});


const createAgentSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.nativeEnum(AgentCategory),
  pageUrl: z.string().min(1, "Page URL is required"),
  prompt: z.union([z.string().min(10), AgentPromptSchema]),
  knowledge: z.array(agentKnowledgeSourceSchema).optional(),
});


// POST /api/agents
export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = createAgentSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...agentData } = validation.data;
        const agentRef = adminDb.collection('agents').doc(id);
        const doc = await agentRef.get();

        if (doc.exists) {
            return handleApiError({ message: 'An agent with this ID already exists.' }, 409);
        }

        const newAgent = {
            ...agentData,
            isEnabled: true, // New agents are enabled by default
        };

        await agentRef.set(newAgent);
        
        return createApiResponse({ id: agentRef.id, ...newAgent }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
