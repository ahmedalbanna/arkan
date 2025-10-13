/**
 * API Route لتقرير المعاملات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتقرير المعاملات
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
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
class TransactionReportHandler extends SimpleApiHandler<any[]> {
    protected async processRequest(context: any) {
        const { searchParams } = new URL(context.request.url);
        const queryValidation = getReportSchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            throw new Error(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { startDate, endDate } = queryValidation.data;
        const transactions = await getTransactionsByDateRange(startDate, endDate);

        return transactions;
    }
}

// إنشاء المعالج
const transactionReportHandler = new TransactionReportHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    transactionReportHandler,
    { requireAdmin: true, logging: true }
);
