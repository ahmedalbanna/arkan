
import { getStorage } from 'firebase-admin/storage';
import { createTransaction } from '@/lib/db/queries';
import { getDatabase } from 'firebase-admin/database';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

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

    const storage = getStorage();
    const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');
    const fileName = `payment_proofs/${userId}/${Date.now()}-${file.name}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await bucket.file(fileName).save(fileBuffer, {
      metadata: { contentType: file.type },
    });

    const [fileUrl] = await bucket.file(fileName).getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    const transactionData = {
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

    const { id: transactionId } = await createTransaction(transactionData);

    const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
    if (!adminsSnapshot.empty) {
      const rtdb = getDatabase();
      const notificationPayload = {
        title: "New Payment Request",
        description: `User ${userName || userEmail} submitted a payment request for $${price}.`,
        icon: "credit-card",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/admin/manage-payments'
      };

      const notificationPromises = adminsSnapshot.docs.map(adminDoc => {
          const adminId = adminDoc.id;
          const notificationRef = rtdb.ref(`notifications/${adminId}`).push();
          return notificationRef.set(notificationPayload);
      });
      await Promise.all(notificationPromises);
    }

    return createApiResponse({ message: 'Request submitted successfully for review.', transactionId }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
