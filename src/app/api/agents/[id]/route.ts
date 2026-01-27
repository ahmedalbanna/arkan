// src/app/api/agents/[id]/route.ts
import { getDoc, updateDoc, deleteDoc } from '@/lib/firebase/db-helpers';
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';

const agentUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    prompt: z.string().optional(),
    guidelines: z.array(z.string()).optional(),
    isEnabled: z.boolean().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
});

export const GET = withAuth(async ({ params }) => {
    try {
        let { id } = params;
        let agent = await getDoc('agents', id);

        if (!agent) {
            return handleApiError({ message: 'Agent not found' }, 404);
        }
        return createApiResponse(agent, 200);
    } catch (error) {
        return handleApiError(error);
    }
});

export const PUT = withAuth(async ({ request, params }) => {
    try {
        let { id } = params;
        let body = await request.json();
        let validation = agentUpdateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        let updated = await updateDoc('agents', id, {
            ...validation.data,
            updatedAt: new Date().toISOString(),
        });
        return createApiResponse(updated, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

export const DELETE = withAuth(async ({ params }) => {
    try {
        let { id } = params;
        await deleteDoc('agents', id);
        return createApiResponse({ message: 'Agent deleted successfully' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
