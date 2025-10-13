/**
 * API Route للمعاملات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للمعاملات
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { getTransactionsByDateRange, getTransactionsByStatus } from '@/lib/db/queries';
import { z } from 'zod';

// Schema لجلب المعاملات
const getTransactionsSchema = z.object({
    status: z.enum(['pending', 'verified', 'rejected']).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(6).optional(),
    lastVisibleId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

/**
 * معالج جلب المعاملات
 */
class GetTransactionsHandler extends SimpleApiHandler<any> {
    protected inputSchema = getTransactionsSchema;
    protected requiresAdmin = true;

    protected async processRequest(context: any) {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const queryValidation = getTransactionsSchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            throw new Error(queryValidation.error.message);
        }

        const { limit, lastVisibleId, status, startDate, endDate } = queryValidation.data;

        // Handle report generation request
        if (startDate && endDate) {
            const transactions = await getTransactionsByDateRange(startDate, endDate);
            return transactions;
        }

        // Handle status-based fetching for the console
        if (status) {
            const { transactions, hasNextPage, lastVisibleId: newLastVisibleId } = await getTransactionsByStatus({
                status,
                limit: limit!,
                lastVisibleId
            });
            return { transactions, hasNextPage, lastVisibleId: newLastVisibleId };
        }

        throw new Error('Missing required parameters. Provide either status or both startDate and endDate.');
    }
}

// إنشاء المعالج
const getTransactionsHandler = new GetTransactionsHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getTransactionsHandler,
    { requireAdmin: true, logging: true }
);
