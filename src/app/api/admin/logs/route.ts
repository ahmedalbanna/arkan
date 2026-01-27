'use server';

import { z } from 'zod';
import { paginateQuery } from '@/lib/firebase/db-helpers';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { getUserProfile } from '@/services/userService';

const getLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  lastVisibleId: z.string().optional(),
});

export const GET = withAuth(async ({ request }) => {
    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = getLogsQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return handleApiError(queryValidation.error);
        }

        const { limit, agentId, userId, lastVisibleId } = queryValidation.data;

        // Build query filters
        const filters = [];
        if (agentId) {
            filters.push({ field: 'agentId', operator: '==' as const, value: agentId });
        }
        if (userId) {
            filters.push({ field: 'userId', operator: '==' as const, value: userId });
        }

        // Use paginateQuery helper with proper cursor handling
        const result = await paginateQuery(
            'agent_generations',
            limit,
            lastVisibleId,
            {
                filters: filters.length > 0 ? filters : undefined,
                orderBy: { field: 'createdAt', direction: 'desc' },
            }
        );

        // Enrich logs with user profile data
        const logsPromises = result.items.map(async (doc) => {
            const userProfile = await getUserProfile((doc as any).userId);
            return {
                ...doc,
                userName: userProfile?.name || 'Unknown User',
            };
        });

        const logs = await Promise.all(logsPromises);

        return createApiResponse({
            logs,
            hasNextPage: result.hasNextPage,
            lastVisibleId: result.lastVisibleId,
        }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
