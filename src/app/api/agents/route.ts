/**
 * API Route للوكلاء - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
        const snapshot = await adminDb.collection('agents')
            .where('isEnabled', '==', true)
            .orderBy('name')
            .get();

        const agents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return ApiResponse.success(agents);
    } catch (error) {
        console.error('Error fetching agents:', error);
        return ApiResponse.error('Failed to fetch agents', 500);
    }
}, { requireAuth: false });
