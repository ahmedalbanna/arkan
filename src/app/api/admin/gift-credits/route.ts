'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { getUserProfile, addUserCredits } from '@/services/userService';
import { sendGiftCreditsNotification } from '@/services/notificationService';

const giftCreditsSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  credits: z.coerce.number().int().positive('Credits must be a positive number.'),
  message: z.string().optional(),
});

/**
 * POST /api/admin/gift-credits
 * Admin-only endpoint to gift credits to a user
 */
export const POST = withAuth(
  async ({ request, user: adminUser }) => {
    try {
      const body = await request.json();
      const validation = giftCreditsSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { userId, credits, message } = validation.data;

      // Get the user's profile to ensure they exist
      const userProfile = await getUserProfile(userId);
      if (!userProfile) {
        return handleApiError({ message: 'User not found.' }, 404);
      }

      // Add credits to user's account using transaction
      await addUserCredits(userId, credits);

      // Create notification for the user
      await sendGiftCreditsNotification(userId, credits, adminUser.name || 'An administrator', message);

      // Log the gift transaction if GenerationLog is being used for this
      // Or create a specific record if there's a gift ledger table
      await prisma.creditLedger.create({
        data: {
          userId,
          type: 'credit',
          amount: credits,
          balance: userProfile.credits + credits,
          reason: `Admin gift${message ? ': ' + message : ''}`,
          referenceType: 'admin_gift',
        },
      });

      return createApiResponse(
        { message: `Successfully gifted ${credits} credits to ${userProfile.name || userProfile.email}.` },
        200
      );
    } catch (error) {
      console.error('Error gifting credits:', error);
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
