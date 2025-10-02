/**
 * API Route لتقارير المعاملات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتقارير المعاملات
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { getTransactionsByDateRange } from '@/lib/db/queries';
import { z } from 'zod';

// Schema لتقرير المعاملات
const getReportSchema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
});

/**
 * معالج تقرير المعاملات
 */
class GetTransactionsReportHandler extends SimpleApiHandler<any[]> {
    protected inputSchema = getReportSchema;
    protected requiresAdmin = true;

    protected async processRequest(context: any) {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const queryValidation = getReportSchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            throw new Error(queryValidation.error.message);
        }

        const { startDate, endDate } = queryValidation.data;
        const transactions = await getTransactionsByDateRange(startDate, endDate);
        return transactions;
    }
}

// إنشاء المعالج
const getTransactionsReportHandler = new GetTransactionsReportHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getTransactionsReportHandler.handle.bind(getTransactionsReportHandler),
    { requireAdmin: true, logging: true }
);
