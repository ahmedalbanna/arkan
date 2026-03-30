
'use server';

import { z } from 'zod';
import { withAuth, handleApiError, handleUserResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

import { giftCreditsSchema } from '@/modules/users/domain/schemas/index';

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

    return handleUserResult(result);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
