/**
 * API Route لتقارير المعاملات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { getTransactionsByDateRange } from '@/lib/db/queries';
import { z } from 'zod';

// Schema لتقرير المعاملات
const getReportSchema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
});

export const GET = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const queryValidation = getReportSchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return ApiResponse.badRequest(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { startDate, endDate } = queryValidation.data;
        const transactions = await getTransactionsByDateRange(startDate, endDate);
        return ApiResponse.success(transactions);
    } catch (error) {
        console.error('Error fetching transactions report:', error);
        return ApiResponse.error('Failed to fetch transactions report', 500);
    }
}, { requireAdmin: true });
