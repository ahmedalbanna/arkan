/**
 * API Route للتحقق من الدفع - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

export const POST = createApiHandler(async (context) => {
    try {
        const { user: adminUser, request } = context;
        const { transactionId, userId, creditsToGrant, status, adminNotes } = await request.json();
        const adminId = adminUser.id;

        const transactionRef = adminDb.collection('transactions').doc(transactionId);
        const rtdb = adminRealtimeDb;
        const notificationRef = rtdb.ref(`notifications/${userId}`).push();

        if (status === 'verified') {
            await verifyPayment(transactionRef, userId, creditsToGrant, adminNotes, adminId);
            await sendApprovalNotification(notificationRef, creditsToGrant);
        } else { // 'rejected'
            await rejectPayment(transactionRef, adminNotes, adminId);
            await sendRejectionNotification(notificationRef);
        }

        return ApiResponse.success({
            message: `Transaction ${status} successfully.`
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return ApiResponse.error('Failed to verify payment', 500);
    }
}, { validateBody: verifyPaymentSchema, requireAdmin: true });

async function verifyPayment(
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

async function rejectPayment(
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

async function sendApprovalNotification(notificationRef: any, creditsToGrant: number) {
    await notificationRef.set({
        title: "Payment Approved",
        description: `Your purchase of ${creditsToGrant} credits has been approved.`,
        icon: "credit-card",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/payment-history'
    });
}

async function sendRejectionNotification(notificationRef: any) {
    await notificationRef.set({
        title: "Payment Rejected",
        description: `Your recent purchase could not be verified. Please contact support.`,
        icon: "credit-card",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/payment-history'
    });
}
