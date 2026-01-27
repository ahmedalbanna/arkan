import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { listDocs } from '@/lib/firebase/db-helpers';

// Public endpoint to fetch admins for support chat initiation
export async function GET() {
    try {
        let admins = await listDocs('users', {
            filters: [{ field: 'role', operator: '==' as const, value: 'admin' }],
        });
        let adminsList = admins.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            email: doc.email,
            profilePictureUrl: doc.profilePictureUrl,
        }));
        return createApiResponse(adminsList, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
