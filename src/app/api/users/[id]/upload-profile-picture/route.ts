
import { revalidatePath } from 'next/cache';
import { withAuth, handleApiError, handleResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export const POST = withAuth(async ({ request, params, user }) => {
    try {
        const { id: targetUserId } = await params;

        // Check if the user is an admin or is updating their own profile
        if (user.role !== 'admin' && user.id !== targetUserId) {
            return handleApiError({ message: 'Forbidden' }, 403);
        }

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
        const result = await controller.uploadProfilePicture(targetUserId, fileBuffer, file.name, file.type);

        if (result.isSuccess) {
            revalidatePath(`/profile/${targetUserId}`);
        }

        return handleResult(result);

    } catch (error) {
        return handleApiError(error);
    }
});
