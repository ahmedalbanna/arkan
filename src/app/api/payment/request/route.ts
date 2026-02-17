
import { getStorage } from 'firebase-admin/storage';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { createTransaction } from '@/services/transactionService';
import prisma from '@/lib/db/prisma';
import admin from 'firebase-admin';

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

    let storage = getStorage();
    let bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');
    let fileName = `payment_proofs/${userId}/${Date.now()}-${file.name}`;

    let fileBuffer = Buffer.from(await file.arrayBuffer());

    await bucket.file(fileName).save(fileBuffer, {
      metadata: { contentType: file.type },
    });

    let [fileUrl] = await bucket.file(fileName).getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

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

    // Query admin users from PostgreSQL
    let admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, name: true, email: true },
    });

    if (admins.length > 0) {
      let rtdb = admin.database();
      let notificationPayload = {
        title: "New Payment Request",
        description: `User ${userName || userEmail} submitted a payment request for $${price}.`,
        icon: "credit-card",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/admin/manage-payments'
      };

      let notificationPromises = admins.map(admin => {
          let notificationRef = rtdb.ref(`notifications/${admin.id}`).push();
          return notificationRef.set(notificationPayload);
      });
      await Promise.all(notificationPromises);
    }

    return createApiResponse({ message: 'Request submitted successfully for review.', transactionId }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
