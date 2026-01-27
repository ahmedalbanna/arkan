// src/app/api/agents/route.ts
import { listDocs, getDoc, createDoc } from '@/lib/firebase/db-helpers';
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';

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
        let { searchParams } = new URL(request.url);
        let category = searchParams.get('category');
        let enabledOnly = searchParams.get('enabledOnly') !== 'false';

        let filters = [];
        if (category) {
            filters.push({ field: 'category', operator: '==' as const, value: category });
        }
        if (enabledOnly) {
            filters.push({ field: 'isEnabled', operator: '==' as const, value: true });
        }

        let agents = await listDocs('agents', {
            filters: filters.length > 0 ? filters : undefined,
            orderBy: { field: 'name', direction: 'asc' },
        });

        return createApiResponse(agents, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


export const POST = withAuth(async ({ request }) => {
    try {
        let body = await request.json();
        let validation = agentSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        let { id, ...agentData } = validation.data;
        
        let existing = await getDoc('agents', id);
        if (existing) {
            return handleApiError({ message: 'Agent with this ID already exists.' }, 409);
        }

        let agent = await createDoc('agents', {
            ...agentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return createApiResponse(agent, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
