
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { auth as adminAuth } from '@/lib/firebase/admin';
import { updateUserCredits } from '@/lib/db/queries';

// This would be a protected route, only accessible by admins.
// For now, we are simulating the admin role check.

const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  creditsToGrant: z.number().int().positive(),
  status: z.enum(['verified', 'rejected']),
  adminNotes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // In a real app, you'd verify the requester is an admin
    // const token = request.headers.get('Authorization')?.split(' ')[1];
    // const decodedToken = await adminAuth.verifyIdToken(token);
    // if (decodedToken.role !== 'admin') {
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    // }

    const body = await request.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { transactionId, userId, creditsToGrant, status, adminNotes } = validation.data;

    const transactionRef = adminDb.collection('transactions').doc(transactionId);

    if (status === 'verified') {
      // Use a transaction to ensure atomicity
      await adminDb.runTransaction(async (t) => {
        // 1. Update the user's credit balance
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error('User not found');
        const newBalance = (userDoc.data()?.credits || 0) + creditsToGrant;
        t.update(userRef, { credits: newBalance });

        // 2. Update the transaction status
        t.update(transactionRef, {
          status: 'verified',
          adminNotes: adminNotes || 'Payment verified and credits granted.',
          verifiedAt: new Date().toISOString(),
          // verifiedBy: decodedToken.uid
        });
      });

    } else { // 'rejected'
      await transactionRef.update({
        status: 'rejected',
        adminNotes: adminNotes || 'Payment could not be verified.',
        verifiedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ message: `Transaction ${status} successfully.` }, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
