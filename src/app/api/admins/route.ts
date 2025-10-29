
import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { adminDb } from '@/lib/firebase/server-init';

// Public endpoint to fetch admins for support chat initiation
export async function GET() {
    try {
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        const admins = adminsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            profilePictureUrl: doc.data().profilePictureUrl,
        }));
        return createApiResponse(admins, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
