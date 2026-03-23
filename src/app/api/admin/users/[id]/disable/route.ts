import { withAuth, handleApiError, handleResult } from "@/lib/utils/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";
import { z } from "zod";

const schema = z.object({
    isDisabled: z.boolean()
});

export const POST = withAuth(async ({ params, request, user: requester }) => {
    try {
        if (requester.role !== 'admin') {
            return handleApiError(new Error("Unauthorized: Admin access required"), 403);
        }
        const { id: userId } = await params;
        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            throw validation.error;
        }

        const controller = container.resolve(UserController);
        const result = await controller.disableUser(userId, validation.data.isDisabled);
        
        return handleResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
