
'use server';

import { z } from 'zod';
import { withAuth, handleApiError, handleResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

const giftCreditsSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  credits: z.coerce.number().int().positive('Credits must be a positive number.'),
  message: z.string().optional(),
});

export const POST = withAuth(async ({ request, user: adminUser }) => {
  try {
    const body = await request.json();
    const validation = giftCreditsSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { userId, credits, message } = validation.data;

    const controller = container.resolve(UserController);
    const result = await controller.giftCredits(userId, credits);

    return handleResult(result);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
