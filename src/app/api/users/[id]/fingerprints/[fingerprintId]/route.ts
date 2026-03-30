import { withAuth, handleApiError, handleUserResult } from "@/infrastructure/api/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";
import { checkUserUpdatePermission } from "@/modules/users/domain/utils/authorization";

export const DELETE = withAuth(async ({ params, user: requester }) => {
    try {
        const { id: userId, fingerprintId } = await params;

        // Check authorization (user can revoke their own, admin can revoke any)
        const authError = checkUserUpdatePermission(requester, userId);
        if (authError) return authError;

        const controller = container.resolve(UserController);
        const result = await controller.revokeFingerprint({ userId, fingerprintId });
        
        return handleUserResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
