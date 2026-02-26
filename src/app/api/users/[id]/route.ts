
import { withAuth, handleApiError, createApiResponse } from "@/lib/utils/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";
import { adminUpdateUserSchema, userUpdateSchema } from "@/lib/schemas/api-schemas";
import { checkUserAccessPermission, checkUserUpdatePermission } from "@/lib/utils/authorization";

// GET a single user profile.
export const GET = withAuth(async ({ params, user: requester }) => {
    try {
        const { id: targetUserId } = await params;

        // Check authorization
        const authError = checkUserAccessPermission(requester, targetUserId);
        if (authError) return authError;

        const controller = container.resolve(UserController);
        const user = await controller.getUser(targetUserId);
        
        if (!user) {
            return handleApiError({ message: "User not found." }, 404);
        }
        return createApiResponse(user, 200);
    } catch (error) {
        return handleApiError(error);
    }
});

// PUT (update) a user profile
export const PUT = withAuth(async ({ request, params, user: requester }) => {
    try {
        const { id: userId } = await params;
        const body = await request.json();

        // Check authorization
        const authError = checkUserUpdatePermission(requester, userId);
        if (authError) return authError;

        // Select schema based on role
        const schema = requester.role === 'admin' ? adminUpdateUserSchema : userUpdateSchema;
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const controller = container.resolve(UserController);
        const updatedUser = await controller.updateUser(userId, validation.data, requester.email);
        
        return createApiResponse(updatedUser, 200);
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            return handleApiError({ message: "This email is already in use by another account." }, 409);
        }
        return handleApiError(error);
    }
});
