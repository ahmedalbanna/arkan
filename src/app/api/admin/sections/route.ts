import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const SectionSchema = z.object({
  id: z.string().min(3, 'ID must be at least 3 characters'),
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['report', 'diagram', 'presentation']),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  model: z.string().optional(),
});

// GET all sections
export const GET = withAuth(async ({ user: _user }) => {
  try {
    let sections = await prisma.section.findMany({
      orderBy: { title: 'asc' },
    });
    return createApiResponse(sections, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

// POST a new section (Admin only)
export const POST = withAuth(async ({ request }) => {
  try {
    let body = await request.json();
    let validation = SectionSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    let { id, ...data } = validation.data;
    let section = await prisma.section.create({
      data: {
        id,
        ...data,
      },
    });
    return createApiResponse(section, 201);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
