/**
 * API Route لطلب الشراء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لطلب الشراء
 */

import { handleApiErrorEnhanced } from '@/core/api';
import { ComplexApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { createTransaction } from '@/lib/db/queries';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';

export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * معالج طلب الشراء
 */
class PurchaseRequestHandler extends ComplexApiHandler<FormData, {
    message: string;
    transactionId: string;
}> {
    protected inputSchema = purchaseRequestSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: FormData, context: any): Promise<{ message: string; transactionId: string }> {
        const file = data.get('file') as File | null;
        const userId = data.get('userId') as string | null;
        const planId = data.get('planId') as string | null;
        const planName = data.get('planName') as string | null;
        const credits = data.get('credits') as string | null;
        const price = data.get('price') as string | null;
        const userName = data.get('userName') as string | null;
        const userEmail = data.get('userEmail') as string | null;

        if (!file || !userId || !planId || !credits || !price) {
            return handleApiErrorEnhanced({ message: 'Missing required fields.' }, '400');
        }

        // رفع الملف إلى Firebase Storage
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

        // إرسال إشعار للمدراء
        await this.notifyAdmins(userName, userEmail, price);

        return {
            message: 'Request submitted successfully for review.',
            transactionId
        } as { message: string; transactionId: string };
    }

    private async notifyAdmins(userName: string | null, userEmail: string | null, price: string | null) {
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.empty) return;

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
}

// إنشاء المعالج
const purchaseRequestHandler = new PurchaseRequestHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    purchaseRequestHandler,
    {
        logging: true
    }
);
