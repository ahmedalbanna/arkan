import { withAuth, handleApiError, handleResult } from "@/infrastructure/api/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";
import { checkUserAccessPermission } from "@/modules/users/domain/utils/authorization";

export const GET = withAuth(async ({ params, user: requester }) => {
    try {
        const { id: targetUserId } = await params;

        // Check authorization
        const authError = checkUserAccessPermission(requester, targetUserId);
        if (authError) return authError;

        const controller = container.resolve(UserController);
        const result = await controller.getLoginHistory(targetUserId);

        return handleResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
