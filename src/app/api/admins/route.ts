/**
 * API Route لقائمة المدراء - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.empty) {
            return ApiResponse.success([]);
        }
        const admins = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return ApiResponse.success(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        return ApiResponse.error('Failed to fetch admins', 500);
    }
}, { requireAuth: true });
