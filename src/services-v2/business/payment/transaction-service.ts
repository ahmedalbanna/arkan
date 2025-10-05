/**
 * خدمة المعاملات - Services v2.0
 *
 * خدمة محسنة لإدارة المعاملات والتحقق من المدفوعات مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface TransactionProperties {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: 'purchase' | 'refund' | 'subscription';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    description: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface VerifyPaymentVariables {
    transactionId: string;
    action: 'approve' | 'reject';
    notes?: string;
}

export type TransactionStatus = 'pending' | 'verified' | 'rejected';

export interface FetchTransactionsParams {
    token: string;
    status: TransactionStatus;
    limit: number;
    lastVisibleId?: string;
    startDate?: string;
    endDate?: string;
}

export interface FetchReportParams {
    token: string;
    startDate: string;
    endDate: string;
}

export class TransactionServiceV2 extends BaseService {
    constructor() {
        super('TransactionServiceV2');
    }

    /**
     * جلب المعاملات مع مراقبة الأداء
     */
    async getTransactions(params: FetchTransactionsParams): Promise<{
        transactions: TransactionProperties[];
        hasNextPage: boolean;
        lastVisibleId?: string | null;
        totalCount: number;
    }> {
        const operationId = this.startOperation('getTransactions');

        try {
            const { token, status, limit, lastVisibleId, startDate, endDate } = params;

            if (!token) {
                throw new Error("Authentication token is required.");
            }

            const queryParams = new URLSearchParams({
                status,
                limit: limit.toString(),
            });

            if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);

            const response = await fetch(`/api/admin/transactions?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch transactions');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.transactions?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.getTransactions');
            throw error;
        }
    }

    /**
     * التحقق من الدفع مع مراقبة شاملة
     */
    async verifyPayment(variables: VerifyPaymentVariables, token: string): Promise<TransactionProperties> {
        const operationId = this.startOperation('verifyPayment');

        try {
            if (!token) {
                throw new Error("Authentication token is required.");
            }

            const response = await fetch('/api/admin/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(variables),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to verify payment');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.verifyPayment');
            throw error;
        }
    }

    /**
     * جلب معاملات التقرير مع مراقبة الأداء
     */
    async fetchTransactionsForReport(params: FetchReportParams): Promise<TransactionProperties[]> {
        const operationId = this.startOperation('fetchTransactionsForReport');

        try {
            const { token, startDate, endDate } = params;

            if (!token) {
                throw new Error("Authentication token is required.");
            }

            const queryParams = new URLSearchParams({ startDate, endDate });

            const response = await fetch(`/api/admin/transactions/report?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch transaction report data');
            }

            const transactions = await response.json();
            this.endOperation(operationId, { success: true, recordCount: transactions.length });
            return transactions;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.fetchTransactionsForReport');
            throw error;
        }
    }

    /**
     * جلب معاملات المستخدم مع مراقبة شاملة
     */
    async fetchUserTransactions(token: string): Promise<TransactionProperties[]> {
        const operationId = this.startOperation('fetchUserTransactions');

        try {
            if (!token) {
                throw new Error("Authentication token is required.");
            }

            const response = await fetch('/api/user-transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch payment history');
            }

            const transactions = await response.json();
            this.endOperation(operationId, { success: true, recordCount: transactions.length });
            return transactions;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.fetchUserTransactions');
            throw error;
        }
    }

    /**
     * جلب معاملة محددة مع مراقبة الأداء
     */
    async getTransaction(transactionId: string, token: string): Promise<TransactionProperties | null> {
        const operationId = this.startOperation('getTransaction');

        try {
            const response = await fetch(`/api/transactions/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    this.endOperation(operationId, { success: true, result: 'not-found' });
                    return null;
                }
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch transaction');
            }

            const transaction = await response.json();
            this.endOperation(operationId, { success: true });
            return transaction;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.getTransaction');
            throw error;
        }
    }

    /**
     * إلغاء معاملة مع مراقبة شاملة
     */
    async cancelTransaction(transactionId: string, token: string): Promise<TransactionProperties> {
        const operationId = this.startOperation('cancelTransaction');

        try {
            const response = await fetch(`/api/transactions/${transactionId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel transaction');
            }

            const transaction = await response.json();
            this.endOperation(operationId, { success: true });
            return transaction;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.cancelTransaction');
            throw error;
        }
    }

    /**
     * طلب استرداد معاملة مع مراقبة الأداء
     */
    async requestRefund(transactionId: string, reason: string, token: string): Promise<{
        refundRequest: any;
        message: string;
    }> {
        const operationId = this.startOperation('requestRefund');

        try {
            const response = await fetch(`/api/transactions/${transactionId}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to request refund');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.requestRefund');
            throw error;
        }
    }

    /**
     * جلب إحصائيات المعاملات مع مراقبة شاملة
     */
    async getTransactionStats(token: string, timeRange: 'day' | 'week' | 'month' = 'month'): Promise<{
        totalAmount: number;
        totalTransactions: number;
        averageAmount: number;
        statusBreakdown: Record<string, number>;
        paymentMethodBreakdown: Record<string, number>;
    }> {
        const operationId = this.startOperation('getTransactionStats');

        try {
            const response = await fetch(`/api/admin/transactions/stats?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transaction stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.getTransactionStats');
            throw error;
        }
    }

    /**
     * تصدير معاملات إلى CSV مع مراقبة الأداء
     */
    async exportTransactions(params: FetchTransactionsParams): Promise<string> {
        const operationId = this.startOperation('exportTransactions');

        try {
            const { token, status, limit, lastVisibleId, startDate, endDate } = params;

            if (!token) {
                throw new Error("Authentication token is required.");
            }

            const queryParams = new URLSearchParams({
                status,
                limit: limit.toString(),
                export: 'true'
            });

            if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);

            const response = await fetch(`/api/admin/transactions?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to export transactions');
            }

            const csvData = await response.text();
            this.endOperation(operationId, { success: true });
            return csvData;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.exportTransactions');
            throw error;
        }
    }

    /**
     * جلب معاملات المستخدم بالتصفية مع مراقبة شاملة
     */
    async getFilteredTransactions(token: string, filters: {
        status?: TransactionStatus;
        paymentMethod?: string;
        minAmount?: number;
        maxAmount?: number;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        transactions: TransactionProperties[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const operationId = this.startOperation('getFilteredTransactions');

        try {
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`/api/user/transactions/filter?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch filtered transactions');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.transactions?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TransactionServiceV2.getFilteredTransactions');
            throw error;
        }
    }
}