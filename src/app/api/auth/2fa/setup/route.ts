import { withAuth, handleApiError, handleResult } from "@/lib/utils/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";

export const POST = withAuth(async ({ user: requester }) => {
    try {
        const controller = container.resolve(UserController);
        const result = await controller.setup2FA(requester.uid);
        return handleResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
