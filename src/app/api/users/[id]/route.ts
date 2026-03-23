
import { revalidatePath } from "next/cache";
import { withAuth, handleApiError, handleResult } from "@/lib/utils/api-utils";
import { container } from "@/infrastructure/di/container";
import { adminUpdateUserSchema, userUpdateSchema } from "@/lib/schemas/api-schemas";
import { checkUserAccessPermission, checkUserUpdatePermission } from "@/lib/utils/authorization";
import { UserController } from "@/modules/users/adapters/controllers/UserController";

// GET a single user profile.
export const GET = withAuth(async ({ params, user: requester }) => {
    try {
        const { id: targetUserId } = await params;

        // Check authorization
        const authError = checkUserAccessPermission(requester, targetUserId);
        if (authError) return authError;

        const controller = container.resolve(UserController);
        const result = await controller.getUser(targetUserId);
        
        return handleResult(result);
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
        const result = await controller.updateUser(userId, validation.data);

        if (result.isSuccess) {
            revalidatePath(`/profile/${userId}`);
            revalidatePath('/admin/manage-users');
        }
        
        return handleResult(result);
    } catch (error: any) {
        return handleApiError(error);
    }
});
