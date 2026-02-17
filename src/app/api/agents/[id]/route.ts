// src/app/api/agents/[id]/route.ts
import { prisma } from '@/lib/db/prisma';
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
        const { id } = await params;
        const agent = await prisma.agent.findUnique({
            where: { id },
            include: { category: true },
        });

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
        const { id } = await params;
        const body = await request.json();
        const validation = agentUpdateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const agent = await prisma.agent.update({
            where: { id },
            data: {
                name: validation.data.name,
                description: validation.data.description,
                categoryId: validation.data.category,
                config: {
                    prompt: validation.data.prompt,
                    guidelines: validation.data.guidelines,
                    version: validation.data.version,
                    author: validation.data.author,
                },
                isActive: validation.data.isEnabled,
            },
            include: { category: true },
        });

        return createApiResponse(agent, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id } = await params;
        await prisma.agent.delete({
            where: { id },
        });
        return createApiResponse({ message: 'Agent deleted successfully' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
