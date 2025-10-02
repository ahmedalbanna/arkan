import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';
// GET all enabled agents
export const GET = withEnhancedAuth(async ({ user }) => {
  try {
    const snapshot = await adminDb.collection('agents').where('isEnabled', '==', true).orderBy('name').get();
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return createApiResponseEnhanced(agents, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
