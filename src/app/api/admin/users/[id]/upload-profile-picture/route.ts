
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export const POST = withAuth(async ({ request, params }) => {
    try {
        const { id: targetUserId } = await params;

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return handleApiError({ message: 'No file uploaded.' }, 400);
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return handleApiError({ message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, 400);
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const controller = container.resolve(UserController);
        const publicUrl = await controller.uploadProfilePicture(targetUserId, fileBuffer, file.name, file.type);

        return createApiResponse({ profilePictureUrl: publicUrl }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
