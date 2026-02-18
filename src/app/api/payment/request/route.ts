
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { createTransaction } from '@/services/transactionService';
import prisma from '@/lib/db/prisma';

export const config = {
    api: {
        bodyParser: false,
    },
};

export const POST = withAuth(async ({ request }) => {
  try {
    let formData = await request.formData();
    let file = formData.get('file') as File | null;
    let userId = formData.get('userId') as string | null;
    let planId = formData.get('planId') as string | null;
    let planName = formData.get('planName') as string | null;
    let credits = formData.get('credits') as string | null;
    let price = formData.get('price') as string | null;
    let userName = formData.get('userName') as string | null;
    let userEmail = formData.get('userEmail') as string | null;

    if (!file || !userId || !planId || !credits || !price) {
      return handleApiError({ message: 'Missing required fields.' }, 400);
    }

    // TODO: Implement file storage using alternatives like:
    // - AWS S3
    // - Cloudinary
    // - UploadThing
    // - Vercel Blob Storage
    // For now, we'll store the file name as a placeholder
    let fileName = `payment_proofs/${userId}/${Date.now()}-${file.name}`;
    let fileUrl = `/uploads/${fileName}`; // Placeholder URL

    let transactionData = {
      userId,
      planId,
      planName: planName || 'Unknown Plan',
      credits: parseInt(credits, 10),
      price: parseFloat(price),
      userName: userName || 'N/A',
      userEmail: userEmail || 'N/A',
      status: 'pending' as const,
      proofUrl: fileUrl,
    };

    let { id: transactionId } = await createTransaction(transactionData);

    // TODO: Implement notification system using alternatives like:
    // - Email notifications (SendGrid, Resend)
    // - WebSocket/Pusher for real-time notifications
    // - In-app notification table in PostgreSQL
    console.log(`New payment request from ${userName || userEmail} for $${price}`);

    return createApiResponse({ message: 'Request submitted successfully for review.', transactionId }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
