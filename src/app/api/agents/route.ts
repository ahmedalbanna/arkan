// src/app/api/agents/route.ts
import { prisma } from '@/lib/db/prisma';
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';

const agentSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  isEnabled: z.boolean().default(true),
  author: z.string().default('Custom'),
  version: z.string().default('1.0'),
});

/**
 * GET /api/agents
 * Fetch agents with optional filtering by category
 */
export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const enabledOnly = searchParams.get('enabledOnly') !== 'false';

    const whereClause: any = {};
    
    if (category) {
      whereClause.category = {
        name: category,
      };
    }
    
    if (enabledOnly) {
      whereClause.isEnabled = true;
    }

    const agents = await prisma.agent.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    const response = agents.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      categoryId: a.categoryId,
      category: a.category?.name,
      prompt: a.prompt,
      guidelines: a.guidelines,
      isEnabled: a.isEnabled,
      author: a.author,
      version: a.version,
      createdAt: a.createdAt.toISOString(),
    }));

    return createApiResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/agents
 * Admin-only endpoint to create a new agent
 */
export const POST = withAuth(
  async ({ request }) => {
    try {
      const body = await request.json();
      const validation = agentSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { id, categoryId, ...agentData } = validation.data;

      // Check if agent already exists
      const existing = await prisma.agent.findUnique({
        where: { id },
      });

      if (existing) {
        return handleApiError({ message: 'Agent with this ID already exists.' }, 409);
      }

      // Verify category exists
      const category = await prisma.agentCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return handleApiError({ message: 'Category not found' }, 404);
      }

      const newAgent = await prisma.agent.create({
        data: {
          id,
          categoryId,
          ...agentData,
        },
      });

      return createApiResponse(
        {
          id: newAgent.id,
          name: newAgent.name,
          description: newAgent.description,
          categoryId: newAgent.categoryId,
          prompt: newAgent.prompt,
          guidelines: newAgent.guidelines,
          isEnabled: newAgent.isEnabled,
          author: newAgent.author,
          version: newAgent.version,
          createdAt: newAgent.createdAt.toISOString(),
        },
        201
      );
    } catch (error) {
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
