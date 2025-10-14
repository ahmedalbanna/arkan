/**
 * API Route للمعاملات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

export const GET = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const queryValidation = getTransactionsSchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return ApiResponse.badRequest(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { limit, lastVisibleId, status, startDate, endDate } = queryValidation.data;

        // Handle report generation request
        if (startDate && endDate) {
            const transactions = await getTransactionsByDateRange(startDate, endDate);
            return ApiResponse.success(transactions);
        }

        // Handle status-based fetching for the console
        if (status) {
            const { transactions, hasNextPage, lastVisibleId: newLastVisibleId } = await getTransactionsByStatus({
                status,
                limit: limit!,
                lastVisibleId
            });
            return ApiResponse.success({ transactions, hasNextPage, lastVisibleId: newLastVisibleId });
        }

        return ApiResponse.badRequest('Missing required parameters. Provide either status or both startDate and endDate.');
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return ApiResponse.error('Failed to fetch transactions', 500);
    }
}, { requireAdmin: true });
