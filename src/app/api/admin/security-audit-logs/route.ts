import { withAuth, handleApiError, handleResult } from "@/lib/utils/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";

export const GET = withAuth(async ({ user: requester }) => {
    try {
        if (requester.role !== 'admin') {
            return handleApiError(new Error("Unauthorized: Admin access required"), 403);
        }

        const controller = container.resolve(UserController);
        const result = await controller.getSecurityAuditLogs();
        
        return handleResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
