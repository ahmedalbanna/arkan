
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';

const getLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  lastVisibleId: z.string().optional(),
});

export const GET = withAuth(async ({ request }) => {
    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = getLogsQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return handleApiError(queryValidation.error);
        }

        const controller = container.resolve(AdminController);
        const result = await controller.getGenerationLogs(queryValidation.data);

        return createApiResponse(result, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
