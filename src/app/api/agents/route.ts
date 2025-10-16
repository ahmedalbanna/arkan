import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';

// GET all enabled agents
export const GET = withAuth(async ({ user }) => {
  try {
    const snapshot = await adminDb.collection('agents').where('isEnabled', '==', true).orderBy('name').get();
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return createApiResponse(agents, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
