'use server';

import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const getLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  skip: z.coerce.number().int().min(0).default(0),
});

export const GET = withAuth(async ({ request }) => {
    try {
        let { searchParams } = new URL(request.url);
        let queryValidation = getLogsQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return handleApiError(queryValidation.error);
        }

        let { limit, agentId, userId, skip } = queryValidation.data;

        // Build filter conditions
        let where: any = {};
        if (agentId) {
            where.metadata = {
              path: ['agentId'],
              equals: agentId,
            };
        }
        if (userId) {
            where.userId = userId;
        }

        // Fetch logs with pagination
        let logs = await prisma.generationLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit + 1, // Fetch one extra to check for next page
            skip,
            include: {
              // No relations to include for now
            },
        });

        // Get user names for each log
        let logsWithUserNames = await Promise.all(
            logs.slice(0, limit).map(async (log) => {
                let user = log.userId ? await prisma.user.findUnique({
                    where: { id: log.userId },
                    select: { name: true },
                }) : null;
                return {
                    ...log,
                    userName: user?.name || 'Unknown User',
                };
            })
        );

        let hasNextPage = logs.length > limit;

        return createApiResponse({
            logs: logsWithUserNames,
            hasNextPage,
            nextSkip: hasNextPage ? skip + limit : null,
        }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
