// src/app/api/agent-categories/route.ts
import { prisma } from '@/lib/db/prisma';
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';

/**
 * GET /api/agent-categories
 * Fetch all agent categories
 */
export const GET = withAuth(async () => {
  try {
    const categories = await prisma.agentCategory.findMany({
      orderBy: { name: 'asc' },
    });

    const response = categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      icon: c.icon,
      order: c.order,
      createdAt: c.createdAt.toISOString(),
    }));

    return createApiResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
