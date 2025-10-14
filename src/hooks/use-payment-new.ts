/**
 * hooks المدفوعات - النظام الجديد
 *
 * هذا الملف يستخدم النظام الجديد للخدمات مع الحفاظ على التوافق مع النظام القديم
 */

'use client';

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/core/utils/authUtils";
import { transactionKeys, userKeys } from "@/core/utils/query-keys";
import { useToast } from "@/hooks";
import { Transaction, type TransactionProperties } from '@/lib/models/transaction';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from 'zod';

// === النظام الجديد ===
import { paymentUtils } from '@/core/services';

// === النظام القديم (للتوافق) ===
import { legacyServices } from '@/core/services/compatibility-layer';

// === أنواع البيانات ===
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

export interface VerifyPaymentVariables {
  transactionId: string;
  userId: string;
  creditsToGrant: number;
  status: 'verified' | 'rejected';
  adminNotes?: string;
}

// === Schemas للتحقق من البيانات ===
const paymentDataSchema = z.object({
  amount: z.number().min(1, "المبلغ يجب أن يكون أكبر من صفر"),
  currency: z.string().min(1, "العملة مطلوبة"),
  paymentMethod: z.string().min(1, "طريقة الدفع مطلوبة"),
  description: z.string().optional(),
});

const creditPurchaseSchema = z.object({
  credits: z.number().min(1, "عدد الائتمانات يجب أن يكون أكبر من صفر"),
  amount: z.number().min(1, "المبلغ يجب أن يكون أكبر من صفر"),
  currency: z.string().min(1, "العملة مطلوبة"),
  paymentMethod: z.string().min(1, "طريقة الدفع مطلوبة"),
});

const paymentProofSchema = z.object({
  transactionId: z.string().min(1, "معرف المعاملة مطلوب"),
  notes: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  transactionId: z.string().min(1, "معرف المعاملة مطلوب"),
  status: z.enum(['verified', 'rejected']),
  notes: z.string().optional(),
});

const paymentReportSchema = z.object({
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
  format: z.enum(['pdf', 'xlsx', 'csv']).optional(),
});

export type PaymentDataFormValues = z.infer<typeof paymentDataSchema>;
export type CreditPurchaseFormValues = z.infer<typeof creditPurchaseSchema>;
export type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;
export type VerifyPaymentFormValues = z.infer<typeof verifyPaymentSchema>;
export type PaymentReportFormValues = z.infer<typeof paymentReportSchema>;

// === Hooks المدفوعات الأساسية ===

/**
 * Hook لخصم الائتمانات
 */
export function useDeductCreditsNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.deductCreditsWithErrorHandling(userId, amount);

        if (result.success) {
          return result.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.deductCreditsApi(userId, amount);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم خصم الائتمانات",
        description: message || "تم خصم الائتمانات بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في خصم الائتمانات",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لشراء الائتمانات
 */
export function usePurchaseCreditsNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreditPurchaseData) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.purchaseCreditsWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.purchaseCreditsApi(data, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم شراء الائتمانات",
        description: "تم شراء الائتمانات بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في شراء الائتمانات",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لإرسال إثبات الدفع
 */
export function useSubmitPaymentProofNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentProofData) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.submitPaymentProofWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.submitPaymentProofApi(data, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم إرسال إثبات الدفع",
        description: "تم إرسال إثبات الدفع بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إرسال إثبات الدفع",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook للحصول على المعاملات
 */
export function useTransactionsNew(status?: 'pending' | 'verified' | 'rejected') {
  const { firebaseUser } = useAuth();

  return useInfiniteQuery({
    queryKey: transactionKeys.list(status || 'all'),
    queryFn: async ({ pageParam }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.getTransactionsWithErrorHandling({
          status,
          limit: 6,
          lastVisibleId: pageParam
        }, token);

        if (result.success) {
          return {
            transactions: result.data.transactions.map(t => new Transaction(t as TransactionProperties)),
            hasNextPage: result.data.hasNextPage,
            lastVisibleId: result.data.lastVisibleId
          };
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.getTransactionsApi({
          status,
          limit: 6,
          lastVisibleId: pageParam,
          token
        });

        if (legacyResult.success) {
          return {
            transactions: legacyResult.data.transactions.map(t => new Transaction(t as TransactionProperties)),
            hasNextPage: legacyResult.data.hasNextPage,
            lastVisibleId: legacyResult.data.lastVisibleId
          };
        }

        throw new Error(legacyResult.error);
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: !!firebaseUser,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook للحصول على معاملات المستخدم
 */
export function useUserTransactionsNew() {
  const { firebaseUser } = useAuth();

  return useQuery<Transaction[]>({
    queryKey: transactionKeys.list(firebaseUser?.uid || 'user'),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.getUserTransactionsWithErrorHandling(token);

        if (result.success) {
          return result.data.map(t => new Transaction(t as TransactionProperties));
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.fetchUserTransactionsApi(token);

        if (legacyResult.success) {
          return legacyResult.data.map(t => new Transaction(t as TransactionProperties));
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser,
  });
}

/**
 * Hook للتحقق من الدفع
 */
export function useVerifyPaymentNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: VerifyPaymentVariables) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.verifyPaymentWithErrorHandling({
          transactionId: variables.transactionId,
          status: variables.status,
          notes: variables.adminNotes
        }, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.verifyPaymentApi(variables, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data, variables) => {
      toast({
        title: "تم تحديث المعاملة",
        description: `تم تحديد المعاملة كـ ${variables.status === 'verified' ? 'مؤكدة' : 'مرفوضة'}.`,
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في التحقق من الدفع",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لإحصائيات المعاملات
 */
export function useTransactionStatsNew() {
  const { firebaseUser } = useAuth();

  return useQuery<UserTransactionStats>({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.getTransactionStatsWithErrorHandling(token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.getTransactionStatsApi(token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook لتصدير تقرير المدفوعات
 */
export function useExportPaymentReportNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentReportData) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await paymentUtils.exportPaymentReportWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.payment.exportPaymentReportApi(data, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تصدير تقرير المدفوعات",
        description: "تم تصدير تقرير المدفوعات بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['payment-reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تصدير تقرير المدفوعات",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Hooks للواجهات ===

/**
 * Hook لإدارة المدفوعات المتقدمة
 */
export function useAdvancedPaymentManagementNew() {
  const deductCreditsMutation = useDeductCreditsNew();
  const purchaseCreditsMutation = usePurchaseCreditsNew();
  const submitPaymentProofMutation = useSubmitPaymentProofNew();
  const verifyPaymentMutation = useVerifyPaymentNew();
  const exportReportMutation = useExportPaymentReportNew();

  const pendingTransactionsQuery = useTransactionsNew('pending');
  const verifiedTransactionsQuery = useTransactionsNew('verified');
  const rejectedTransactionsQuery = useTransactionsNew('rejected');
  const userTransactionsQuery = useUserTransactionsNew();
  const transactionStatsQuery = useTransactionStatsNew();

  const handleDeductCredits = (userId: string, amount: number) => {
    deductCreditsMutation.mutate({ userId, amount });
  };

  const handlePurchaseCredits = (data: CreditPurchaseData) => {
    purchaseCreditsMutation.mutate(data);
  };

  const handleSubmitPaymentProof = (data: PaymentProofData) => {
    submitPaymentProofMutation.mutate(data);
  };

  const handleVerifyPayment = (variables: VerifyPaymentVariables) => {
    verifyPaymentMutation.mutate(variables);
  };

  const handleExportReport = (data: PaymentReportData) => {
    exportReportMutation.mutate(data);
  };

  return {
    // البيانات
    pendingTransactions: pendingTransactionsQuery.data?.pages.flatMap(page => page.transactions) ?? [],
    verifiedTransactions: verifiedTransactionsQuery.data?.pages.flatMap(page => page.transactions) ?? [],
    rejectedTransactions: rejectedTransactionsQuery.data?.pages.flatMap(page => page.transactions) ?? [],
    userTransactions: userTransactionsQuery.data ?? [],
    transactionStats: transactionStatsQuery.data,

    // حالة التحميل
    isLoading: pendingTransactionsQuery.isLoading || verifiedTransactionsQuery.isLoading || rejectedTransactionsQuery.isLoading,
    isError: pendingTransactionsQuery.isError || verifiedTransactionsQuery.isError || rejectedTransactionsQuery.isError,
    error: pendingTransactionsQuery.error || verifiedTransactionsQuery.error || rejectedTransactionsQuery.error,

    // الطرق
    handleDeductCredits,
    handlePurchaseCredits,
    handleSubmitPaymentProof,
    handleVerifyPayment,
    handleExportReport,

    // حالة الطفرات
    isDeductingCredits: deductCreditsMutation.isPending,
    isPurchasingCredits: purchaseCreditsMutation.isPending,
    isSubmittingProof: submitPaymentProofMutation.isPending,
    isVerifyingPayment: verifyPaymentMutation.isPending,
    isExportingReport: exportReportMutation.isPending,

    // النتائج
    deductResult: deductCreditsMutation.data,
    purchaseResult: purchaseCreditsMutation.data,
    submitProofResult: submitPaymentProofMutation.data,
    verifyResult: verifyPaymentMutation.data,
    exportResult: exportReportMutation.data,

    // طرق التصفح
    fetchNextPendingPage: pendingTransactionsQuery.fetchNextPage,
    fetchNextVerifiedPage: verifiedTransactionsQuery.fetchNextPage,
    fetchNextRejectedPage: rejectedTransactionsQuery.fetchNextPage,
    hasNextPendingPage: pendingTransactionsQuery.hasNextPage,
    hasNextVerifiedPage: verifiedTransactionsQuery.hasNextPage,
    hasNextRejectedPage: rejectedTransactionsQuery.hasNextPage,
  };
}

/**
 * Hook لإدارة المدفوعات المبسطة
 */
export function useSimplePaymentManagementNew() {
  const purchaseCreditsMutation = usePurchaseCreditsNew();
  const userTransactionsQuery = useUserTransactionsNew();
  const transactionStatsQuery = useTransactionStatsNew();

  const handlePurchaseCredits = (data: CreditPurchaseData) => {
    purchaseCreditsMutation.mutate(data);
  };

  return {
    // البيانات
    userTransactions: userTransactionsQuery.data ?? [],
    transactionStats: transactionStatsQuery.data,

    // حالة التحميل
    isLoading: userTransactionsQuery.isLoading || transactionStatsQuery.isLoading,
    isError: userTransactionsQuery.isError || transactionStatsQuery.isError,
    error: userTransactionsQuery.error || transactionStatsQuery.error,

    // الطرق
    handlePurchaseCredits,

    // حالة الطفرات
    isPurchasingCredits: purchaseCreditsMutation.isPending,

    // النتائج
    purchaseResult: purchaseCreditsMutation.data,
  };
}
