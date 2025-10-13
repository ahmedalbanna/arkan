/**
 * API Route لقائمة المدراء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقائمة المدراء
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج جلب قائمة المدراء
 */
class GetAdminsHandler extends SimpleApiHandler<any[]> {
    protected async processRequest() {
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.empty) {
            return [];
        }
        const admins = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return admins;
    }
}

// إنشاء المعالج
const getAdminsHandler = new GetAdminsHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getAdminsHandler,
    { logging: true }
);
