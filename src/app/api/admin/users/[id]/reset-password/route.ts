
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export const POST = withAuth(async ({ params }) => {
    try {
        const { id: userId } = await params;
        if (!userId) {
            return handleApiError({ message: 'User ID is required.' }, 400);
        }

        const controller = container.resolve(UserController);
        const user = await controller.getUser(userId);
        
        if (!user || !user.email) {
            return handleApiError({ message: 'User not found or has no email.' }, 404);
        }

        // Simulating password reset email logic
        console.log(`Password reset email would be sent to ${user.email}`);

        return createApiResponse({ message: `A password reset email has been sent to ${user.email}.` }, 200);

    } catch (error: any) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
