/**
 * خدمة الائتمانات - Services v2.0
 *
 * خدمة محسنة لإدارة الائتمانات وخصمها مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface CreditDeductionResult {
    success: boolean;
    previousBalance: number;
    newBalance: number;
    deductedAmount: number;
    transactionId?: string;
}

export interface CreditTransaction {
    id: string;
    userId: string;
    amount: number;
    type: 'deduction' | 'addition' | 'refund';
    description: string;
    referenceId?: string;
    createdAt: string;
}

export class CreditServiceV2 extends BaseService {
    constructor() {
        super('CreditServiceV2');
    }

    /**
     * خصم ائتمانات من حساب المستخدم مع مراقبة الأداء
     */
    async deductCredit(userId: string, amount: number = 1): Promise<CreditDeductionResult> {
        const operationId = this.startOperation('deductCredit');

        try {
            // السماح بتعطيل خصم الائتمانات في بيئات التطوير إذا لزم الأمر
            if (process.env.DEDUCT_CREDITS === 'false') {
                this.endOperation(operationId, { success: true, result: 'disabled-in-dev' });
                return {
                    success: true,
                    previousBalance: 0,
                    newBalance: 0,
                    deductedAmount: 0
                };
            }

            if (amount === 0) {
                this.endOperation(operationId, { success: true, result: 'zero-amount' });
                return {
                    success: true,
                    previousBalance: 0,
                    newBalance: 0,
                    deductedAmount: 0
                };
            }

            // جلب معلومات المستخدم
            const { getUserProfile } = await import('@/lib/db/queries');
            const user = await getUserProfile(userId);

            if (!user) {
                throw new Error("User not found to deduct credits.");
            }

            // فحص الائتمانات قبل محاولة المعاملة
            if (user.credits === undefined || user.credits < amount) {
                throw {
                    status: 402,
                    message: "Insufficient credits. Please purchase more to continue.",
                    code: 'INSUFFICIENT_CREDITS'
                };
            }

            const previousBalance = user.credits;

            // خصم الائتمانات
            const { deductUserCredits } = await import('@/lib/db/queries');
            await deductUserCredits(userId, amount);

            const result: CreditDeductionResult = {
                success: true,
                previousBalance,
                newBalance: previousBalance - amount,
                deductedAmount: amount
            };

            this.endOperation(operationId, { success: true, deductedAmount: amount });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CreditServiceV2.deductCredit');
            throw error;
        }
    }

    /**
     * إضافة ائتمانات لحساب المستخدم مع مراقبة شاملة
     */
    async addCredits(userId: string, amount: number, description: string = 'Credit addition'): Promise<CreditDeductionResult> {
        const operationId = this.startOperation('addCredits');

        try {
            if (amount <= 0) {
                throw new Error("Amount must be positive");
            }

            // جلب معلومات المستخدم
            const { getUserProfile } = await import('@/lib/db/queries');
            const user = await getUserProfile(userId);

            if (!user) {
                throw new Error("User not found to add credits.");
            }

            const previousBalance = user.credits || 0;
            const newBalance = previousBalance + amount;

            // إضافة الائتمانات
            const { addUserCredits } = await import('@/lib/db/queries');
            await addUserCredits(userId, amount);

            // تسجيل المعاملة
            await this.logCreditTransaction({
                userId,
                amount,
                type: 'addition',
                description,
                previousBalance,
                newBalance
            });

            const result: CreditDeductionResult = {
                success: true,
                previousBalance,
                newBalance,
                deductedAmount: -amount // سالب للإضافة
            };

            this.endOperation(operationId, { success: true, addedAmount: amount });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CreditServiceV2.addCredits');
            throw error;
        }
    }

    /**
     * فحص رصيد المستخدم مع مراقبة الأداء
     */
    async checkUserCredits(userId: string): Promise<{ balance: number; currency: string }> {
        const operationId = this.startOperation('checkUserCredits');

        try {
            const { getUserProfile } = await import('@/lib/db/queries');
            const user = await getUserProfile(userId);

            if (!user) {
                throw new Error("User not found");
            }

            const result = {
                balance: user.credits || 0,
                currency: 'credits'
            };

            this.endOperation(operationId, { success: true, balance: result.balance });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CreditServiceV2.checkUserCredits');
            throw error;
        }
    }

    /**
     * جلب تاريخ معاملات الائتمانات مع مراقبة شاملة
     */
    async getCreditHistory(userId: string, limit: number = 20, offset: number = 0): Promise<{
        transactions: CreditTransaction[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const operationId = this.startOperation('getCreditHistory');

        try {
            const response = await fetch(`/api/user/credits/history?limit=${limit}&offset=${offset}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch credit history');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.transactions?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CreditServiceV2.getCreditHistory');
            throw error;
        }
    }

    /**
     * استرداد ائتمانات مع مراقبة الأداء
     */
    async refundCredits(userId: string, amount: number, reason: string): Promise<CreditDeductionResult> {
        const operationId = this.startOperation('refundCredits');

        try {
            if (amount <= 0) {
                throw new Error("Refund amount must be positive");
            }

            const addResult = await this.addCredits(userId, amount, `Refund: ${reason}`);

            // تسجيل معاملة الاسترداد
            await this.logCreditTransaction({
                userId,
                amount,
                type: 'refund',
                description: `Refund: ${reason}`,
                previousBalance: addResult.previousBalance,
                newBalance: addResult.newBalance
            });

            this.endOperation(operationId, { success: true, refundedAmount: amount });
            return addResult;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CreditServiceV2.refundCredits');
            throw error;
        }
    }

    /**
     * فحص ما إذا كان لدى المستخدم ائتمانات كافية مع مراقبة شاملة
     */
    async hasEnoughCredits(userId: string, requiredAmount: number): Promise<boolean> {
        const operationId = this.startOperation('hasEnoughCredits');

        try {
            const { balance } = await this.checkUserCredits(userId);
            const hasEnough = balance >= requiredAmount;

            this.endOperation(operationId, { success: true, hasEnough, requiredAmount, balance });
            return hasEnough;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CreditServiceV2.hasEnoughCredits');
            return false;
        }
    }

    /**
     * جلب إحصائيات الائتمانات مع مراقبة الأداء
     */
    async getCreditStats(userId: string, timeRange: 'day' | 'week' | 'month' = 'month'): Promise<{
        totalSpent: number;
        totalEarned: number;
        currentBalance: number;
        transactionsCount: number;
    }> {
        const operationId = this.startOperation('getCreditStats');

        try {
            const response = await fetch(`/api/user/credits/stats?range=${timeRange}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch credit stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CreditServiceV2.getCreditStats');
            throw error;
        }
    }

    /**
     * تسجيل معاملة ائتمان مع مراقبة شاملة (دالة مساعدة داخلية)
     */
    private async logCreditTransaction(transaction: {
        userId: string;
        amount: number;
        type: 'deduction' | 'addition' | 'refund';
        description: string;
        previousBalance: number;
        newBalance: number;
        referenceId?: string;
    }): Promise<void> {
        try {
            const transactionRecord: Omit<CreditTransaction, 'id'> = {
                userId: transaction.userId,
                amount: transaction.amount,
                type: transaction.type,
                description: transaction.description,
                referenceId: transaction.referenceId,
                createdAt: new Date().toISOString()
            };

            // حفظ في قاعدة البيانات
            const { saveCreditTransaction } = await import('@/lib/db/queries');
            await saveCreditTransaction(transactionRecord);

        } catch (error) {
            console.error('Failed to log credit transaction:', error);
            // لا نرمي خطأ هنا لتجنب فشل العملية الرئيسية
        }
    }
}