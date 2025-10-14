/**
 * خدمات الدفع والائتمانات المبسطة
 *
 * نظام مبسط لإدارة المدفوعات والائتمانات
 */

import type { TransactionProperties } from '@/lib/models/transaction';
import { api } from './simple-service';

// أنواع البيانات
export interface PaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
}

export interface CreditPurchaseData {
  credits: number;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface PaymentProofData {
  transactionId: string;
  proofFile: File;
  notes?: string;
}

export interface VerifyPaymentData {
  transactionId: string;
  status: 'verified' | 'rejected';
  notes?: string;
}

export interface TransactionFilters {
  status?: 'pending' | 'verified' | 'rejected';
  limit?: number;
  lastVisibleId?: string;
}

export interface PaymentReportData {
  startDate: string;
  endDate: string;
  format?: 'pdf' | 'xlsx' | 'csv';
}

export interface UserTransactionStats {
  totalTransactions: number;
  totalAmount: number;
  pendingAmount: number;
  verifiedAmount: number;
  rejectedAmount: number;
}

// خدمات الدفع والائتمانات المبسطة
export const paymentService = {
  // === خدمات الائتمانات ===

  // خصم ائتمانات من المستخدم
  async deductCredits(userId: string, amount: number = 1) {
    return api.post<{ message: string }>(`/users/${userId}/deduct-credits`, { amount });
  },

  // شراء ائتمانات
  async purchaseCredits(data: CreditPurchaseData, token: string) {
    return api.post<{ message: string; transactionId: string }>('/payment/purchase-credits', data, { token });
  },

  // === خدمات المدفوعات ===

  // إرسال دليل الدفع
  async submitPaymentProof(data: PaymentProofData, token: string) {
    const formData = new FormData();
    formData.append('transactionId', data.transactionId);
    formData.append('proofFile', data.proofFile);
    if (data.notes) formData.append('notes', data.notes);

    return api.post<{ message: string }>('/payment/submit-proof', formData, {
      token,
      headers: {
        // لا نضع Content-Type للـ FormData
      }
    });
  },

  // === خدمات المعاملات ===

  // الحصول على المعاملات
  async getTransactions(params: TransactionFilters, token: string) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.lastVisibleId) queryParams.append('lastVisibleId', params.lastVisibleId);

    const queryString = queryParams.toString();
    const path = queryString ? `/transactions?${queryString}` : '/transactions';

    return api.get<{ transactions: TransactionProperties[]; hasNextPage: boolean; lastVisibleId?: string | null }>(path, { token });
  },

  // التحقق من المعاملة
  async verifyPayment(data: VerifyPaymentData, token: string) {
    return api.put<{ message: string }>(`/transactions/${data.transactionId}/verify`, {
      status: data.status,
      notes: data.notes
    }, { token });
  },

  // الحصول على معاملات المستخدم
  async getUserTransactions(token: string) {
    return api.get<TransactionProperties[]>('/transactions/user', { token });
  },

  // الحصول على معاملات للتقرير
  async getTransactionsForReport(params: {
    startDate: string;
    endDate: string;
  }, token: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const path = `/transactions/report?${queryString}`;

    return api.get<TransactionProperties[]>(path, { token });
  },

  // === خدمات التقارير ===

  // تصدير تقرير المدفوعات
  async exportPaymentReport(data: PaymentReportData, token: string) {
    return api.post<{ downloadUrl: string }>('/payment/export-report', data, { token });
  },

  // الحصول على إحصائيات المعاملات
  async getTransactionStats(token: string) {
    return api.get<UserTransactionStats>('/transactions/stats', { token });
  },

  // === خدمات الإشعارات ===

  // إرسال إشعار دفع
  async sendPaymentNotification(transactionId: string, token: string) {
    return api.post<{ message: string }>(`/transactions/${transactionId}/notify`, {}, { token });
  },

  // الحصول على إعدادات الدفع
  async getPaymentSettings() {
    return api.get<any>('/payment/settings');
  },

  // تحديث إعدادات الدفع
  async updatePaymentSettings(settings: {
    enabledMethods?: string[];
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
  }, token: string) {
    return api.put<{ message: string }>('/payment/settings', settings, { token });
  },
};

// دوال مساعدة للدفع والائتمانات
export const paymentUtils = {
  // خصم ائتمانات مع معالجة الأخطاء
  async deductCreditsWithErrorHandling(userId: string, amount: number = 1) {
    try {
      const result = await paymentService.deductCredits(userId, amount);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Credits deducted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deduct credits'
      };
    }
  },

  // شراء ائتمانات مع معالجة الأخطاء
  async purchaseCreditsWithErrorHandling(data: CreditPurchaseData, token: string) {
    try {
      const result = await paymentService.purchaseCredits(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to purchase credits'
      };
    }
  },

  // إرسال دليل الدفع مع معالجة الأخطاء
  async submitPaymentProofWithErrorHandling(data: PaymentProofData, token: string) {
    try {
      const result = await paymentService.submitPaymentProof(data, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Payment proof submitted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit payment proof'
      };
    }
  },

  // الحصول على المعاملات مع معالجة الأخطاء
  async getTransactionsWithErrorHandling(params: TransactionFilters, token: string) {
    try {
      const result = await paymentService.getTransactions(params, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transactions'
      };
    }
  },

  // التحقق من المعاملة مع معالجة الأخطاء
  async verifyPaymentWithErrorHandling(data: VerifyPaymentData, token: string) {
    try {
      const result = await paymentService.verifyPayment(data, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Payment verification updated successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment'
      };
    }
  },

  // الحصول على معاملات المستخدم مع معالجة الأخطاء
  async getUserTransactionsWithErrorHandling(token: string) {
    try {
      const result = await paymentService.getUserTransactions(token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user transactions'
      };
    }
  },

  // تصدير تقرير المدفوعات مع معالجة الأخطاء
  async exportPaymentReportWithErrorHandling(data: PaymentReportData, token: string) {
    try {
      const result = await paymentService.exportPaymentReport(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export payment report'
      };
    }
  },

  // الحصول على إحصائيات المعاملات مع معالجة الأخطاء
  async getTransactionStatsWithErrorHandling(token: string) {
    try {
      const result = await paymentService.getTransactionStats(token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transaction stats'
      };
    }
  },

  // تحديث إعدادات الدفع مع معالجة الأخطاء
  async updatePaymentSettingsWithErrorHandling(settings: {
    enabledMethods?: string[];
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
  }, token: string) {
    try {
      const result = await paymentService.updatePaymentSettings(settings, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Payment settings updated successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment settings'
      };
    }
  },

  // === دوال مساعدة إضافية ===

  // التحقق من صحة بيانات الدفع
  validatePaymentData(data: PaymentData): { valid: boolean; error?: string } {
    if (!data.amount || data.amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (!data.currency || data.currency.length !== 3) {
      return { valid: false, error: 'Valid currency code is required' };
    }

    if (!data.paymentMethod) {
      return { valid: false, error: 'Payment method is required' };
    }

    return { valid: true };
  },

  // تنسيق المبلغ للعرض
  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  },

  // حساب الضرائب
  calculateTax(amount: number, taxRate: number = 0.15): number {
    return Math.round(amount * taxRate * 100) / 100;
  },

  // حساب المبلغ الإجمالي
  calculateTotal(amount: number, taxRate: number = 0.15): number {
    const tax = this.calculateTax(amount, taxRate);
    return amount + tax;
  },
};
