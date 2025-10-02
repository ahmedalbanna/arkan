'use server';

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { resetUserPassword } from '@/lib/db/queries';
import { generateRandomPassword } from '@/lib/utils'; // Assuming a utility for password generation
import { NextRequest } from 'next/server';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  id: z.string().uuid(),
});


export const POST = withEnhancedAuth(async ({ user, request }: { user: any, request: NextRequest }) => {
  try {
    // Note: The user ID from the URL parameter is not used here,
    // as the schema only validates the ID in the request body.
    // You might want to adjust the schema or logic if you need to
    // ensure the body ID matches the URL ID.
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const { id } = validation.data;
    const newPassword = generateRandomPassword(8); // Generate a new random password
    await resetUserPassword(id, newPassword); // Pass the generated password
    return createApiResponseEnhanced({ message: 'User password reset successfully.' }, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });
