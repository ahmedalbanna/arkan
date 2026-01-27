import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { listDocs, saveSectionHelper } from '@/lib/firebase/db-helpers';
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
export const GET = withAuth(async ({ user }) => {
  try {
    const sections = await listDocs('sections', {
      orderBy: { field: 'title', direction: 'asc' },
    });
    return createApiResponse(sections, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

// POST a new section (Admin only)
export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = SectionSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    const { id, ...data } = validation.data;
    const sectionData = {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const saved = await saveSectionHelper(sectionData);
    return createApiResponse(saved, 201);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
