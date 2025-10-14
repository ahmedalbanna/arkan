/**
 * API Route لمعاملات المستخدم - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
        const { user } = context;

        const transactionsSnapshot = await adminDb.collection('transactions')
            .where('userId', '==', user.id)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const transactions = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return ApiResponse.success(transactions);
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        return ApiResponse.error('Failed to fetch user transactions', 500);
    }
}, { requireAuth: true });
