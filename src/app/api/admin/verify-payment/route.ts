/**
 * API Route للتحقق من الدفع - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للتحقق من الدفع
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

// Schema للتحقق من الدفع
const verifyPaymentSchema = z.object({
    transactionId: z.string(),
    userId: z.string(),
    creditsToGrant: z.number().int().positive(),
    status: z.enum(['verified', 'rejected']),
    adminNotes: z.string().optional(),
});

/**
 * معالج التحقق من الدفع
 */
class VerifyPaymentHandler extends ComplexApiHandler<{
    transactionId: string;
    userId: string;
    creditsToGrant: number;
    status: 'verified' | 'rejected';
    adminNotes?: string;
}, {
    message: string;
}> {
    protected inputSchema = verifyPaymentSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any) {
        const { transactionId, userId, creditsToGrant, status, adminNotes } = data;
        const { user: adminUser } = context;
        const adminId = adminUser.id;

        const transactionRef = adminDb.collection('transactions').doc(transactionId);
        const rtdb = adminRealtimeDb;
        const notificationRef = rtdb.ref(`notifications/${userId}`).push();

        if (status === 'verified') {
            await this.verifyPayment(transactionRef, userId, creditsToGrant, adminNotes, adminId);
            await this.sendApprovalNotification(notificationRef, creditsToGrant);
        } else { // 'rejected'
            await this.rejectPayment(transactionRef, adminNotes, adminId);
            await this.sendRejectionNotification(notificationRef);
        }

        return {
            message: `Transaction ${status} successfully.`
        };
    }

    private async verifyPayment(
        transactionRef: any,
        userId: string,
        creditsToGrant: number,
        adminNotes: string | undefined,
        adminId: string
    ) {
        await adminDb.runTransaction(async (t: any) => {
            const userRef = adminDb.collection('users').doc(userId);
            t.update(userRef, { credits: FieldValue.increment(creditsToGrant) });

            t.update(transactionRef, {
                status: 'verified',
                adminNotes: adminNotes || 'Payment approved.',
                verifiedAt: new Date().toISOString(),
                verifiedBy: adminId
            });
        });
    }

    private async rejectPayment(
        transactionRef: any,
        adminNotes: string | undefined,
        adminId: string
    ) {
        await transactionRef.update({
            status: 'rejected',
            adminNotes: adminNotes || 'Payment could not be verified.',
            verifiedAt: new Date().toISOString(),
            verifiedBy: adminId,
        });
    }

    private async sendApprovalNotification(notificationRef: any, creditsToGrant: number) {
        await notificationRef.set({
            title: "Payment Approved",
            description: `Your purchase of ${creditsToGrant} credits has been approved.`,
            icon: "credit-card",
            isRead: false,
            createdAt: new Date().toISOString(),
            link: '/payment-history'
        });
    }

    private async sendRejectionNotification(notificationRef: any) {
        await notificationRef.set({
            title: "Payment Rejected",
            description: `Your recent purchase could not be verified. Please contact support.`,
            icon: "credit-card",
            isRead: false,
            createdAt: new Date().toISOString(),
            link: '/payment-history'
        });
    }
}

// إنشاء المعالج
const verifyPaymentHandler = new VerifyPaymentHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    verifyPaymentHandler.handle.bind(verifyPaymentHandler),
    {
        requireAdmin: true,
        logging: true
    }
);
