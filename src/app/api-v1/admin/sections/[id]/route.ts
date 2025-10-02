// C:\Users\ahmed\source\repos\arkan\src\app\api\admin\sections\[id]\route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';
const SectionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  type: z.enum(['report', 'diagram', 'presentation']).optional(),
});

// PUT to update a section (Admin only)
export const PUT = withEnhancedAuth(async ({ request, params }) => {
  try {
    const sectionId = params.id;
    if (!sectionId) {
      return handleApiErrorEnhanced({ message: 'Section ID is required' }, '400');
    }
    const body = await request.json();
    const validation = SectionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }
    const docRef = adminDb.collection('sections').doc(sectionId);
    await docRef.update(validation.data);
    const updatedDoc = await docRef.get();
    return createApiResponseEnhanced({ id: updatedDoc.id, ...updatedDoc.data() }, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });

// DELETE a section (Admin only)
export const DELETE = withEnhancedAuth(async ({ params }) => {
  try {
    const sectionId = params.id;
    if (!sectionId) {
      return handleApiErrorEnhanced({ message: 'Section ID is required' }, '400');
    }
    await adminDb.collection('sections').doc(sectionId).delete();
    return createApiResponseEnhanced({ message: 'Section deleted successfully' }, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });
