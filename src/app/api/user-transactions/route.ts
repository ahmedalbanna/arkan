/**
 * API Route لمعاملات المستخدم - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لمعاملات المستخدم
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { getTransactionsByUserId } from '@/lib/db/queries';

/**
 * معالج معاملات المستخدم
 */
class UserTransactionsHandler extends SimpleApiHandler<any[]> {
    protected async processRequest(context: any) {
        const { user } = context;

        const transactions = await getTransactionsByUserId(user.id);
        return transactions;
    }
}

// إنشاء المعالج
const userTransactionsHandler = new UserTransactionsHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    userTransactionsHandler.handle.bind(userTransactionsHandler),
    {
        logging: true
    }
);
