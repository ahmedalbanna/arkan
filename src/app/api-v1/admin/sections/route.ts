// C:\Users\ahmed\source\repos\arkan\src\app\api\admin\sections\route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';
const SectionSchema = z.object({
  id: z.string().min(3, 'ID must be at least 3 characters'),
  title: z.string().min(1, 'Title is required'),
  icon: z.string().min(1, 'Icon is required'),
  agentId: z.string().min(1, 'Agent is required'),
  type: z.enum(['report', 'diagram', 'presentation']),
});

// GET all sections
export const GET = withEnhancedAuth(async ({ user }) => {
  try {
    const snapshot = await adminDb.collection('sections').orderBy('title').get();
    const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return createApiResponseEnhanced(sections, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});

// POST a new section (Admin only)
export const POST = withEnhancedAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = SectionSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }
    const { id, ...data } = validation.data;
    const docRef = adminDb.collection('sections').doc(id);
    await docRef.set(data);
    return createApiResponseEnhanced({ id, ...data }, 201);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });
