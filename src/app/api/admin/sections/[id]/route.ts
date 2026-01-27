// src/app/api/admin/sections/[id]/route.ts
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { updateDoc, deleteDoc } from '@/lib/firebase/db-helpers';
import { z } from 'zod';

const SectionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['report', 'diagram', 'presentation']).optional(),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  model: z.string().optional(),
});

// PUT to update a section (Admin only)
export const PUT = withAuth(async ({ request, params }) => {
  try {
    let sectionId = params.id;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    let body = await request.json();
    let validation = SectionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    let updated = await updateDoc('sections', sectionId, validation.data);
    return createApiResponse(updated, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });

// DELETE a section (Admin only)
export const DELETE = withAuth(async ({ params }) => {
  try {
    let sectionId = params.id;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    await deleteDoc('sections', sectionId);
    return createApiResponse({ message: 'Section deleted successfully' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
