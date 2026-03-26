import { z } from 'zod';
import { withAuth, handleApiError, handleUserResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

const batchNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  type: z.enum(['info', 'success', 'warning', 'alert', 'error']).default('info'),
  link: z.string().optional(),
});

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = batchNotificationSchema.safeParse(body);
    
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const controller = container.resolve(UserController);
    const result = await controller.sendBatchNotification(validation.data);

    return handleUserResult(result);

  } catch (error: any) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
