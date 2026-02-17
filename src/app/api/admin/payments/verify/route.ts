import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { addUserCredits } from '@/services/userService';
import { sendPaymentNotification } from '@/services/notificationService';

const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  creditsToGrant: z.number().int().positive(),
  status: z.enum(['VERIFIED', 'REJECTED']),
  adminNotes: z.string().optional(),
});

/**
 * POST /api/admin/payments/verify
 * Admin-only endpoint to verify payment transactions
 */
export const POST = withAuth(
  async ({ request, user: adminUser }) => {
    try {
      const body = await request.json();
      const validation = verifyPaymentSchema.safeParse(body);

      if (!validation.success) {
        return handleApiError(validation.error);
      }

      const { transactionId, userId, creditsToGrant, status, adminNotes } = validation.data;
      const adminId = adminUser.id;

      // Use transaction to ensure atomic updates
      const result = await prisma.$transaction(async (tx) => {
        // Update transaction status
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: status,
            verifiedBy: adminId,
            verifiedAt: new Date(),
            rejectionReason: adminNotes || null,
          },
        });

        let notification = null;

        if (status === 'VERIFIED') {
          // Add credits to user
          await tx.user.update({
            where: { id: userId },
            data: {
              credits: {
                increment: creditsToGrant,
              },
            },
          });

          // Create notification
          notification = await tx.notification.create({
            data: {
              userId,
              title: 'Payment Approved',
              description: `Your purchase of ${creditsToGrant} credits has been approved.`,
              icon: 'credit-card',
              link: '/payment-history',
            },
          });

          // Log credit ledger entry
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { credits: true },
          });

          await tx.creditLedger.create({
            data: {
              userId,
              type: 'credit',
              amount: creditsToGrant,
              balance: (user?.credits || 0) + creditsToGrant,
              reason: `Payment verified - Transaction ${transactionId}`,
              referenceId: transactionId,
              referenceType: 'transaction',
            },
          });
        } else {
          // REJECTED status
          notification = await tx.notification.create({
            data: {
              userId,
              title: 'Payment Rejected',
              description: adminNotes || 'Your recent purchase could not be verified. Please contact support.',
              icon: 'alert-circle',
              link: '/payment-history',
            },
          });
        }

        return {
          transaction: updatedTransaction,
          notification,
        };
      });

      return createApiResponse(
        {
          message: `Payment ${status.toLowerCase()} successfully`,
          transaction: {
            id: result.transaction.id,
            status: result.transaction.status,
            verifiedAt: result.transaction.verifiedAt,
          },
        },
        200
      );
    } catch (error) {
      console.error('Error verifying payment:', error);
      return handleApiError(error);
    }
  },
  { requireAdmin: true }
);
