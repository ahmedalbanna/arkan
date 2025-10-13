/**
 * API Route للوكلاء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للوكلاء
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج قائمة الوكلاء
 */
class AgentsListHandler extends SimpleApiHandler<Array<{
    id: string;
    [key: string]: any;
}>> {
    protected async processRequest(context: any) {
        const snapshot = await adminDb.collection('agents')
            .where('isEnabled', '==', true)
            .orderBy('name')
            .get();

        const agents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return agents;
    }
}

// إنشاء المعالج
const agentsListHandler = new AgentsListHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    agentsListHandler,
    {
        logging: true
    }
);
