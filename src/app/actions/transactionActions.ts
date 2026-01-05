
'use server';

import { z } from 'zod';
import { requireAdmin, requireUser } from './_utils/auth';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import type { TransactionProperties } from '@/lib/models/transaction';
import { FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getDatabase } from 'firebase-admin/database';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';

// ============================================================================
// SERVER-SIDE TRANSACTION SERVICE FUNCTIONS
// ============================================================================

export async function createTransaction(data: Omit<TransactionProperties, 'createdAt' | 'id'>) {
    const transactionRef = adminDb.collection('transactions').doc();
    await transactionRef.set({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return { id: transactionRef.id };
}

export async function getTransactionsByStatus({ status, limit, lastVisibleId }: { status: 'pending' | 'verified' | 'rejected', limit: number, lastVisibleId?: string }): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId?: string | null }> {
    let query = adminDb.collection('transactions')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit + 1);

    if (lastVisibleId) {
        const lastDoc = await adminDb.collection('transactions').doc(lastVisibleId).get();
        if (lastDoc.exists) {
            query = query.startAfter(lastDoc);
        }
    }

    const snapshot = await query.get();

    const transactions = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties));
    const hasNextPage = snapshot.docs.length > limit;
    const newLastVisibleId = hasNextPage && transactions.length > 0 ? transactions[transactions.length - 1].id : null;

    return { transactions, hasNextPage, lastVisibleId: newLastVisibleId };
}


export async function getTransactionsByUserId(userId: string): Promise<TransactionProperties[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionProperties);
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionProperties[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionProperties);
}

// ============================================================================
// SERVER ACTIONS (for client-side consumption)
// ============================================================================

export async function listTransactionsByStatusAction(params: { status: TransactionStatus; limit: number; lastVisibleId?: string }) {
  await requireAdmin();
  const schema = z.object({
    status: z.enum(['pending','verified','rejected']),
    limit: z.number().int().min(1).max(50),
    lastVisibleId: z.string().optional(),
  });
  const parsed = schema.parse(params);
  return getTransactionsByStatus(parsed);
}

export async function getTransactionsReportAction(params: { startDate: string; endDate: string }): Promise<TransactionProperties[]> {
  await requireAdmin();
  const schema = z.object({ startDate: z.string(), endDate: z.string() });
  const parsed = schema.parse(params);
  return getTransactionsByDateRange(parsed.startDate, parsed.endDate);
}

export async function getUserTransactionsAction(): Promise<TransactionProperties[]> {
  const user = await requireUser();
  return getTransactionsByUserId(user.id);
}

const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  creditsToGrant: z.number().int().positive(),
  status: z.enum(['verified','rejected']),
  adminNotes: z.string().optional(),
});

export async function verifyPaymentAction(input: z.infer<typeof verifyPaymentSchema>) {
  const adminUser = await requireAdmin();
  const { transactionId, userId, creditsToGrant, status, adminNotes } = verifyPaymentSchema.parse(input);

  const transactionRef = adminDb.collection('transactions').doc(transactionId);
  const rtdb = adminRealtimeDb;
  const notificationRef = rtdb.ref(`notifications/${userId}`).push();

  if (status === 'verified') {
    await adminDb.runTransaction(async (t: any) => {
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error("User not found");
      const currentCredits = userDoc.data()?.credits ?? 0;
      t.update(userRef, { credits: currentCredits + creditsToGrant });
      t.update(transactionRef, {
        status: 'verified',
        adminNotes: adminNotes || 'Payment approved.',
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminUser.id,
      });
    });
    await notificationRef.set({
      title: 'Payment Approved',
      description: `Your purchase of ${creditsToGrant} credits has been approved.`,
      icon: 'credit-card',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/payment-history',
    });
  } else {
    await transactionRef.update({
      status: 'rejected',
      adminNotes: adminNotes || 'Payment could not be verified.',
      verifiedAt: new Date().toISOString(),
      verifiedBy: adminUser.id,
    });
    await notificationRef.set({
      title: 'Payment Rejected',
      description: 'Your recent purchase could not be verified. Please contact support.',
      icon: 'credit-card',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/payment-history',
    });
  }

  return { message: `Transaction ${status} successfully.` };
}

export async function submitPaymentProofAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get('file') as File | null;
  const planId = formData.get('planId') as string | null;
  const planName = (formData.get('planName') as string | null) || 'Unknown Plan';
  const credits = formData.get('credits') as string | null;
  const price = formData.get('price') as string | null;
  const userName = (formData.get('userName') as string | null) || 'N/A';
  const userEmail = (formData.get('userEmail') as string | null) || 'N/A';

  if (!file || !planId || !credits || !price) {
    throw new Error('Missing required fields.');
  }

  const storage = getStorage();
  const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');
  const fileName = `payment_proofs/${user.id}/${Date.now()}-${file.name}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await bucket.file(fileName).save(fileBuffer, { metadata: { contentType: file.type } });
  const [fileUrl] = await bucket.file(fileName).getSignedUrl({ action: 'read', expires: '03-09-2491' });

  const transactionData: Omit<TransactionProperties, 'id' | 'createdAt'> = {
    userId: user.id,
    planId,
    planName,
    credits: parseInt(credits, 10),
    price: parseFloat(price),
    userName,
    userEmail,
    status: 'pending',
    proofUrl: fileUrl,
  } as any;

  const { id: transactionId } = await createTransaction(transactionData as any);

  // Notify admins
  const adminsSnapshot = await adminDb.collection('users').where('role','==','admin').get();
  if (!adminsSnapshot.empty) {
    const rtdb = getDatabase();
    const payload = {
      title: 'New Payment Request',
      description: `User ${userName || userEmail} submitted a payment request for $${price}.`,
      icon: 'credit-card',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/admin/manage-payments',
    };
    const promises = adminsSnapshot.docs.map((adminDoc) => rtdb.ref(`notifications/${adminDoc.id}`).push().set(payload));
    await Promise.all(promises);
  }

  return { message: 'Request submitted successfully for review.', transactionId };
}
