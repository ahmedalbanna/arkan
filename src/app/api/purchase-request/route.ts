
// src/app/api/purchase-request/route.ts
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';
import { createTransaction } from '@/lib/db/queries';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request: Request) {
    const adminAuth = await getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        await adminAuth.verifyIdToken(token, true);

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
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        const storage = getStorage();
        const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');
        const fileName = `payment_proofs/${userId}/${Date.now()}-${file.name}`;
        
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await bucket.file(fileName).save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });

        const [fileUrl] = await bucket.file(fileName).getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // A very distant future date
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

        // Notify all admins about the new pending payment
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (!adminsSnapshot.empty) {
            const rtdb = adminRealtimeDb;
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

        return NextResponse.json({ message: 'Request submitted successfully for review.', transactionId }, { status: 200 });

    } catch (error: any) {
        console.error("Purchase request error:", error);
        return NextResponse.json({ message: error.message || 'An error occurred during submission.' }, { status: 500 });
    }
}
