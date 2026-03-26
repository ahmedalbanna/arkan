
import { withAuth, handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { BillingController } from '@/modules/billing/adapters/controllers/BillingController';

export const config = {
    api: {
        bodyParser: false,
    },
};

export const POST = withAuth(async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const planId = formData.get('planId') as string | null;
    const planName = formData.get('planName') as string | null;
    const credits = formData.get('credits') as string | null;
    const price = formData.get('price') as string | null;
    const userName = formData.get('userName') as string | null;
    const userEmail = formData.get('userEmail') as string | null;

    if (!file || !userId || !planId || !credits || !price) {
      return handleApiError({ message: 'Missing required fields.' }, 400);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const controller = container.resolve(BillingController);
    const result = await controller.submitPaymentRequest({
        file: fileBuffer,
        fileName: file.name,
        contentType: file.type,
        userId,
        planId,
        planName: planName || 'Unknown Plan',
        credits: parseInt(credits, 10),
        price: parseFloat(price),
        userName: userName || 'N/A',
        userEmail: userEmail || 'N/A'
    });

    if (result.isFailure) {
        return handleApiError(result.error);
    }

    const transaction = result.getValue();
    return createApiResponse({ 
        message: 'Request submitted successfully for review.', 
        transactionId: transaction.id 
    }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
