/**
 * خدمة الدفع - Services v2.0
 *
 * خدمة محسنة للدفع وإرسال طلبات الشراء مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface PaymentRequest {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    description: string;
    proofFile?: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreditTransaction {
    id: string;
    userId: string;
    amount: number;
    type: 'purchase' | 'usage' | 'refund' | 'bonus';
    description: string;
    referenceId?: string;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: string;
}

export interface PaymentProofData {
    formData: FormData;
    token: string;
}

export class PaymentServiceV2 extends BaseService {
    constructor() {
        super('PaymentServiceV2');
    }

    /**
     * إرسال إثبات دفع مع مراقبة الأداء
     */
    async submitPaymentProof({ formData, token }: PaymentProofData): Promise<PaymentRequest> {
        const operationId = this.startOperation('submitPaymentProof');

        try {
            if (!token) {
                throw new Error("User not authenticated");
            }

            const response = await fetch('/api/admin/purchase-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit request.');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.submitPaymentProof');
            throw error;
        }
    }

    /**
     * جلب طلبات الدفع للمستخدم مع مراقبة شاملة
     */
    async getUserPaymentRequests(token: string): Promise<PaymentRequest[]> {
        const operationId = this.startOperation('getUserPaymentRequests');

        try {
            const response = await fetch('/api/user/payment-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment requests');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.requests?.length || 0 });
            return result.requests || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.getUserPaymentRequests');
            throw error;
        }
    }

    /**
     * جلب طلب دفع محدد مع مراقبة الأداء
     */
    async getPaymentRequest(requestId: string, token: string): Promise<PaymentRequest | null> {
        const operationId = this.startOperation('getPaymentRequest');

        try {
            const response = await fetch(`/api/user/payment-requests/${requestId}`, {
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
                throw new Error('Failed to fetch payment request');
            }

            const request = await response.json();
            this.endOperation(operationId, { success: true });
            return request;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.getPaymentRequest');
            throw error;
        }
    }

    /**
     * إلغاء طلب دفع مع مراقبة شاملة
     */
    async cancelPaymentRequest(requestId: string, token: string): Promise<void> {
        const operationId = this.startOperation('cancelPaymentRequest');

        try {
            const response = await fetch(`/api/user/payment-requests/${requestId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel payment request');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.cancelPaymentRequest');
            throw error;
        }
    }

    /**
     * جلب رصيد المستخدم مع مراقبة الأداء
     */
    async getUserCredits(token: string): Promise<{ balance: number; transactions: CreditTransaction[] }> {
        const operationId = this.startOperation('getUserCredits');

        try {
            const response = await fetch('/api/user/credits', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user credits');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.getUserCredits');
            throw error;
        }
    }

    /**
     * شراء رصيد مع مراقبة شاملة
     */
    async purchaseCredits(variables: {
        amount: number;
        paymentMethod: string;
        token: string;
    }): Promise<{ transaction: CreditTransaction; paymentUrl?: string }> {
        const operationId = this.startOperation('purchaseCredits');

        try {
            const { amount, paymentMethod, token } = variables;
            const response = await fetch('/api/user/credits/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, paymentMethod })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to purchase credits');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.purchaseCredits');
            throw error;
        }
    }

    /**
     * جلب تاريخ المعاملات مع مراقبة الأداء
     */
    async getTransactionHistory(token: string, limit: number = 20, offset: number = 0): Promise<{
        transactions: CreditTransaction[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const operationId = this.startOperation('getTransactionHistory');

        try {
            const response = await fetch(`/api/user/transactions?limit=${limit}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transaction history');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.transactions?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.getTransactionHistory');
            throw error;
        }
    }

    /**
     * طلب استرداد رصيد مع مراقبة شاملة
     */
    async requestRefund(variables: {
        transactionId: string;
        reason: string;
        token: string;
    }): Promise<{ refundRequest: any }> {
        const operationId = this.startOperation('requestRefund');

        try {
            const { transactionId, reason, token } = variables;
            const response = await fetch('/api/user/refunds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ transactionId, reason })
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
            ErrorHandler.handle(error, 'PaymentServiceV2.requestRefund');
            throw error;
        }
    }

    /**
     * جلب خطط الأسعار مع مراقبة الأداء
     */
    async getPricingPlans(): Promise<Array<{
        id: string;
        name: string;
        credits: number;
        price: number;
        currency: string;
        popular?: boolean;
        features: string[];
    }>> {
        const operationId = this.startOperation('getPricingPlans');

        try {
            const response = await fetch('/api/pricing-plans', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pricing plans');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.plans?.length || 0 });
            return result.plans || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.getPricingPlans');
            throw error;
        }
    }

    /**
     * التحقق من حالة الدفع مع مراقبة شاملة
     */
    async checkPaymentStatus(paymentId: string, token: string): Promise<{
        status: string;
        amount?: number;
        currency?: string;
        completedAt?: string;
    }> {
        const operationId = this.startOperation('checkPaymentStatus');

        try {
            const response = await fetch(`/api/payments/${paymentId}/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check payment status');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'PaymentServiceV2.checkPaymentStatus');
            throw error;
        }
    }
}