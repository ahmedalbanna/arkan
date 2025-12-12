
// src/app/api/agent-categories/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';

export const GET = withAuth(async () => {
    try {
        const snapshot = await adminDb.collection('agent_categories').orderBy('name').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return createApiResponse(categories, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
