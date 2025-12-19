// C:\Users\ahmed\source\repos\arkan\src\app\api\admin\sections\route.ts
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

const SectionSchema = z.object({
  id: z.string().min(3, 'ID must be at least 3 characters'),
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['document', 'presentation']),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
  model: z.string().optional(),
});

// GET all sections
export const GET = withAuth(async ({ user }) => {
  try {
    let snapshot = await adminDb.collection('sections').orderBy('title').get();
    let sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    let docRef = adminDb.collection('sections').doc(id);
    await docRef.set(data);
    return createApiResponse({ id, ...data }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
