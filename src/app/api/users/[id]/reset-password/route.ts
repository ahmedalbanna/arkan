
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
        const result = await controller.getUser(userId);
        
        if (result.isFailure) {
            return handleApiError(result.error, 404);
        }

        const user = result.getValue();
        if (!user.email) {
            return handleApiError({ message: 'User has no email.' }, 404);
        }

        // Placeholder for sending a reset email
        console.log(`Password reset email would be sent to ${user.email}`);

        return createApiResponse({ message: `A password reset email has been sent to ${user.email}.` }, 200);

    } catch (error: any) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
