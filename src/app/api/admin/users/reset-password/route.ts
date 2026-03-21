
'use server';

import { z } from 'zod';
import { generateRandomPassword } from '@/lib/utils/randomPassword';
import { handleResult, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

const resetPasswordSchema = z.object({
  id: z.string().min(1),
});

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { id } = validation.data;
    const newPassword = generateRandomPassword(8);
    
    const controller = container.resolve(UserController);
    const result = await controller.resetPassword(id, newPassword);
    
    return handleResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
