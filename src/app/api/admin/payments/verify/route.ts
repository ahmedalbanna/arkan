import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { updateDoc, runTransaction, addUserCreditsHelper } from '@/lib/firebase/db-helpers';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  creditsToGrant: z.number().int().positive(),
  status: z.enum(['verified', 'rejected']),
  adminNotes: z.string().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    let body = await request.json();
    let validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError({ errors: validation.error.flatten().fieldErrors }, 400);
    }

    let { transactionId, userId, creditsToGrant, status, adminNotes } = validation.data;
    let adminId = user.id;

    let rtdb = adminRealtimeDb;
    let notificationRef = rtdb.ref(`notifications/${userId}`).push();

    if (status === 'verified') {
      await runTransaction(async (t) => {
        await addUserCreditsHelper(userId, creditsToGrant);
        await updateDoc('transactions', transactionId, {
          status: 'verified',
          adminNotes: adminNotes || 'Payment approved.',
          verifiedAt: new Date().toISOString(),
          verifiedBy: adminId
        });
      });
      await notificationRef.set({
        title: "Payment Approved",
        description: `Your purchase of ${creditsToGrant} credits has been approved.`,
        icon: "credit-card",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/payment-history'
      });

    } else { // 'rejected'
      await updateDoc('transactions', transactionId, {
        status: 'rejected',
        adminNotes: adminNotes || 'Payment could not be verified.',
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId,
      });
      await notificationRef.set({
        title: "Payment Rejected",
        description: `Your recent purchase could not be verified. Please contact support.`,
        icon: "credit-card",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/payment-history'
      });
    }

    return createApiResponse({ message: `Transaction ${status} successfully.` }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
