

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, getAdminAuth } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/db/queries';
import { getDatabase } from 'firebase-admin/database';


// Helper to verify admin role from Authorization header
async function verifyAdmin(request: Request) {
    const adminAuth = getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized', adminId: null };
    }
    const token = authorization.substring(7);
    
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') {
            return { authorized: false, message: 'Forbidden', adminId: null };
        }
        return { authorized: true, adminId: decodedToken.uid };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized', adminId: null };
    }
}


const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  userId: z.string(),
  creditsToGrant: z.number().int().positive(),
  status: z.enum(['verified', 'rejected']),
  adminNotes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized || !adminCheck.adminId) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

    const body = await request.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { transactionId, userId, creditsToGrant, status, adminNotes } = validation.data;

    const transactionRef = adminDb.collection('transactions').doc(transactionId);
    
    // Get a reference to the Realtime Database
    const rtdb = getDatabase();
    const notificationRef = rtdb.ref(`notifications/${userId}`).push();

    if (status === 'verified') {
      await adminDb.runTransaction(async (t) => {
        const userRef = adminDb.collection('users').doc(userId);
        t.update(userRef, { credits: FieldValue.increment(creditsToGrant) });

        t.update(transactionRef, {
          status: 'verified',
          adminNotes: adminNotes || 'Payment verified and credits granted.',
          verifiedAt: new Date().toISOString(),
          verifiedBy: adminCheck.adminId
        });
      });
      // Send notification to Realtime Database
      await notificationRef.set({
            title: "Payment Approved",
            description: `Your purchase of ${creditsToGrant} credits has been approved.`,
            icon: "credit-card",
            isRead: false,
            createdAt: new Date().toISOString()
        });

    } else { // 'rejected'
      await adminDb.runTransaction(async (t) => {
          t.update(transactionRef, {
            status: 'rejected',
            adminNotes: adminNotes || 'Payment could not be verified.',
            verifiedAt: new Date().toISOString(),
            verifiedBy: adminCheck.adminId,
          });
      });
       // Send notification to Realtime Database
      await notificationRef.set({
            title: "Payment Rejected",
            description: `Your recent purchase could not be verified. Please contact support.`,
            icon: "credit-card",
            isRead: false,
            createdAt: new Date().toISOString()
        });
    }

    return NextResponse.json({ message: `Transaction ${status} successfully.` }, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
