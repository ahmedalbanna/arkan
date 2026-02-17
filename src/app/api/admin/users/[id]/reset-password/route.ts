
'use server';

import { getUserProfile, resetUserPassword } from '@/services/userService';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { z } from 'zod';

const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /api/admin/users/[id]/reset-password
 * Admin-only endpoint to reset any user's password
 */
export const POST = withAuth(async ({ params, request }) => {
  try {
    const { id: userId } = await params;

    // Validate input
    const body = await request.json();
    const validation = adminResetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { newPassword } = validation.data;

    // Verify user exists
    const user = await getUserProfile(userId);
    if (!user) {
      return handleApiError({ message: 'User not found' }, 404);
    }

    // Reset the password
    await resetUserPassword(userId, newPassword);

    return createApiResponse(
      { message: `Password reset successfully for user ${user.email}` },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
