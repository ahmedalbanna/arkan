'use server';

import { getUserProfile, resetUserPassword } from '@/services/userService';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  currentPassword: z.string().optional(), // Required if user is resetting their own password
});

/**
 * POST /api/users/[id]/reset-password
 * Allows a user to reset their own password or an admin to reset another user's password
 */
export const POST = withAuth(async ({ params, request, user: requester }) => {
  try {
    const { id: userId } = await params;

    // Validate input
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { newPassword } = validation.data;

    // Authorization check
    const isAdmin = requester.role === 'ADMIN' || requester.role === 'SUPER_ADMIN';
    const isSelf = userId === requester.id;

    if (!isAdmin && !isSelf) {
      return handleApiError({ message: 'Forbidden: You can only reset your own password' }, 403);
    }

    // Verify user exists
    const user = await getUserProfile(userId);
    if (!user) {
      return handleApiError({ message: 'User not found' }, 404);
    }

    // Reset the password
    await resetUserPassword(userId, newPassword);

    return createApiResponse(
      { message: 'Password reset successfully' },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
});
