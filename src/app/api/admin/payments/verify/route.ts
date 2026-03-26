
import { createApiResponse, handleApiError, withAuth } from '@/infrastructure/api/api-utils';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { BillingController } from '@/modules/billing/adapters/controllers/BillingController';

const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  creditsToGrant: z.number().int().positive(),
  status: z.enum(['verified', 'rejected']),
  adminNotes: z.string().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError({ errors: validation.error.flatten().fieldErrors }, 400);
    }

    const controller = container.resolve(BillingController);
    const result = await controller.verifyPayment({
        ...validation.data,
        adminId: user.id
    });

    if (result.isFailure) {
        return handleApiError(result.error);
    }

    return createApiResponse({ message: `Transaction ${validation.data.status} successfully.` }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
