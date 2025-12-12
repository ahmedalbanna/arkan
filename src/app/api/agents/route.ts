
// src/app/api/agents/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';
import type { AgentProperties } from '@/lib/models';

const agentSchema = z.object({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens"),
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().min(1),
    prompt: z.string().optional(),
    guidelines: z.array(z.string()).optional(),
    isEnabled: z.boolean().default(true),
    author: z.string().default('Custom'),
    version: z.string().default('1.0'),
});


export const GET = withAuth(async ({ request }) => {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const enabledOnly = searchParams.get('enabledOnly') !== 'false';

        let query: FirebaseFirestore.Query = adminDb.collection('agents');

        if (category) {
            query = query.where('category', '==', category);
        }
        if (enabledOnly) {
            query = query.where('isEnabled', '==', true);
        }

        const snapshot = await query.orderBy('name').get();
        const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return createApiResponse(agents, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = agentSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...agentData } = validation.data;
        const agentRef = adminDb.collection('agents').doc(id);

        const doc = await agentRef.get();
        if (doc.exists) {
            return handleApiError({ message: 'Agent with this ID already exists.' }, 409);
        }

        await agentRef.set({
            ...agentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return createApiResponse({ id, ...agentData }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
