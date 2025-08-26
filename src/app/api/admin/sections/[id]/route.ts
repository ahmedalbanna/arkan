// f:\arkan\src\app\api\admin\sections\[id]\route.ts
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

const SectionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  type: z.enum(['report', 'diagram', 'presentation']).optional(),
});

// PUT to update a section (Admin only)
export const PUT = withAuth(async ({ request, params }) => {
  try {
    const sectionId = params.id;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    const body = await request.json();
    const validation = SectionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    const docRef = adminDb.collection('sections').doc(sectionId);
    await docRef.update(validation.data);
    const updatedDoc = await docRef.get();
    return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });

// DELETE a section (Admin only)
export const DELETE = withAuth(async ({ params }) => {
  try {
    const sectionId = params.id;
    if (!sectionId) {
      return handleApiError({ message: 'Section ID is required' }, 400);
    }
    await adminDb.collection('sections').doc(sectionId).delete();
    return createApiResponse({ message: 'Section deleted successfully' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
