
'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import type { AgentProperties } from '@/lib/models/agent';
import { z } from 'zod';

const importAgentsSchema = z.object({
  agents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    pageUrl: z.string(),
    prompt: z.any(),
    isEnabled: z.boolean(),
    isDefault: z.boolean().optional(),
    // Add other fields as needed for validation
  })),
});

export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = importAgentsSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { agents } = validation.data;
        const batch = adminDb.batch();
        const agentsCollection = adminDb.collection('agents');
        let processedCount = 0;

        for (const agent of agents) {
            const docRef = agentsCollection.doc(agent.id);
            // set with merge:true will create or update the document.
            batch.set(docRef, agent, { merge: true });
            processedCount++;
        }

        await batch.commit();

        return createApiResponse({
            message: `Successfully imported ${processedCount} agents.`,
            count: processedCount,
        }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
