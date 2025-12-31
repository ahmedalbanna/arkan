'use server';

import { z } from 'zod';
import { resetUserPassword } from '@/services/userService';
import { generateRandomPassword } from '@/lib/utils/randomPassword'; // Assuming a utility for password generation
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { NextRequest } from 'next/server';

const resetPasswordSchema = z.object({
  id: z.string().uuid(),
});


export const POST = withAuth(async ({ user, request }: { user: any, request: NextRequest }) => {
  try {
    // Note: The user ID from the URL parameter is not used here,
    // as the schema only validates the ID in the request body.
    // You might want to adjust the schema or logic if you need to
    // ensure the body ID matches the URL ID.
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { id } = validation.data;
    const newPassword = generateRandomPassword(8); // Generate a new random password
 await resetUserPassword(id, newPassword); // Pass the generated password
    return createApiResponse({ message: 'User password reset successfully.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
