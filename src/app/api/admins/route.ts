import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

// Public endpoint to fetch admins for support chat initiation
export async function GET() {
    try {
        const controller = container.resolve(UserController);
        const result = await controller.getAdmins();
        
        if (result.isFailure) {
            return handleApiError(result.error);
        }

        const admins = result.getValue();
        
        // Return only necessary public info
        const publicAdmins = admins.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            profilePictureUrl: admin.profilePictureUrl,
        }));
        
        return createApiResponse(publicAdmins, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
