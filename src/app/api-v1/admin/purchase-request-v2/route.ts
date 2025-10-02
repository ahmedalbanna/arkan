/**
 * API Route لطلبات الشراء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لطلبات الشراء
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { createTransaction } from '@/lib/db/queries';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';

// Schema لطلب الشراء
const purchaseRequestSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    planId: z.string().min(1, 'Plan ID is required'),
    planName: z.string().optional(),
    credits: z.coerce.number().int().positive('Credits must be positive'),
    price: z.coerce.number().positive('Price must be positive'),
    userName: z.string().optional(),
    userEmail: z.string().optional(),
});

/**
 * معالج طلبات الشراء
 */
class PurchaseRequestHandler extends ComplexApiHandler<z.infer<typeof purchaseRequestSchema>, {
    message: string;
    transactionId: string;
}> {
    protected inputSchema = purchaseRequestSchema;
    protected creditCost = 1;
    protected requiresAdmin = true;
    protected async processRequest(data: z.infer<typeof purchaseRequestSchema>, context: any) {
        const { request } = context;
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            throw new Error('Missing payment proof file.');
        }

        const { userId, planId, planName, credits, price, userName, userEmail } = data;

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
            credits,
            price,
            userName: userName || 'N/A',
            userEmail: userEmail || 'N/A',
            status: 'pending' as const,
            proofUrl: fileUrl,
        };

        const { id: transactionId } = await createTransaction(transactionData);

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

        return { message: 'Request submitted successfully for review.', transactionId };
    }
}

// إنشاء المعالج
const purchaseRequestHandler = new PurchaseRequestHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    purchaseRequestHandler.handle.bind(purchaseRequestHandler),
    { logging: true }
);
