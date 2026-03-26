import { withAuth, handleApiError, handleResult } from "@/infrastructure/api/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";
import { z } from "zod";

const schema = z.object({
    token: z.string().length(6)
});

export const POST = withAuth(async ({ user: requester, request }) => {
    try {
        const body = await request.json();
        const validation = schema.safeParse(body);
        if (!validation.success) throw validation.error;

        const controller = container.resolve(UserController);
        const result = await controller.verifyAndEnable2FA(requester.uid, validation.data.token);
        return handleResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
