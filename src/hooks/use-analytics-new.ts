/**
 * hooks التحليلات - النظام الجديد
 *
 * هذا الملف يستخدم النظام الجديد للخدمات مع الحفاظ على التوافق مع النظام القديم
 */

'use client';

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/core/utils/authUtils";
import { analyticsKeys } from "@/core/utils/query-keys";
import { useToast } from "@/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from 'zod';

// === النظام الجديد ===
import { analyticsService, analyticsUtils } from '@/core/services';

// === النظام القديم (للتوافق) ===
import { legacyServices } from '@/core/services/compatibility-layer';

// === أنواع البيانات ===
export interface UserDashboardStats {
  totalGenerations: number;
  creditsUsed: number;
  agentUsageChartData: { name: string; count: number }[];
  recentActivity: {
    id: string;
    userId: string;
    agentId: string;
    createdAt: string;
    input: any;
    output: any;
  }[];
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  metrics: {
    totalUsers?: number;
    totalGenerations?: number;
    totalCreditsUsed?: number;
    averageResponseTime?: number;
    successRate?: number;
  };
}

export interface UsageReport {
  userId: string;
  userName: string;
  totalGenerations: number;
  creditsUsed: number;
  lastActivity: string;
  favoriteAgents: string[];
}

export interface AgentAnalytics {
  agentId: string;
  agentName: string;
  totalUsage: number;
  successRate: number;
  averageResponseTime: number;
  userSatisfaction: number;
  lastUsed: string;
}

export interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  totalRequests: number;
}

export interface CustomReportData {
  name: string;
  description?: string;
  metrics: string[];
  filters: any;
  schedule?: 'daily' | 'weekly' | 'monthly';
}

export interface ExportReportData {
  startDate: string;
  endDate: string;
  format: 'pdf' | 'xlsx' | 'csv';
  includeUsers?: boolean;
  includeAgents?: boolean;
}

// === Schemas للتحقق من البيانات ===
const analyticsParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

const customReportSchema = z.object({
  name: z.string().min(1, "اسم التقرير مطلوب"),
  description: z.string().optional(),
  metrics: z.array(z.string()).min(1, "يجب تحديد مقاييس واحدة على الأقل"),
  filters: z.any(),
  schedule: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

const exportReportSchema = z.object({
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
  format: z.enum(['pdf', 'xlsx', 'csv']),
  includeUsers: z.boolean().optional(),
  includeAgents: z.boolean().optional(),
});

export type AnalyticsParamsFormValues = z.infer<typeof analyticsParamsSchema>;
export type CustomReportFormValues = z.infer<typeof customReportSchema>;
export type ExportReportFormValues = z.infer<typeof exportReportSchema>;

// === Hooks التحليلات الأساسية ===

/**
 * Hook لإحصائيات المستخدم
 */
export function useUserStatsNew() {
  const { firebaseUser } = useAuth();

  return useQuery<UserDashboardStats>({
    queryKey: analyticsKeys.userStats(firebaseUser?.uid || ''),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await analyticsUtils.getUserStatsWithErrorHandling(token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

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
 * Hook لإحصائيات النظام
 */
export function useSystemStatsNew() {
  const { firebaseUser } = useAuth();

  return useQuery<SystemMetrics>({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await analyticsUtils.getSystemStatsWithErrorHandling(token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

        if (legacyResult.success) {
          return legacyResult.data as SystemMetrics;
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook لتحليلات الاستخدام
 */
export function useUsageAnalyticsNew() {
  const { firebaseUser } = useAuth();

  return useQuery<AnalyticsData>({
    queryKey: ['usage-analytics'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await analyticsService.getUsageAnalytics(token, {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          groupBy: 'day'
        });

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

        if (legacyResult.success) {
          return legacyResult.data as AnalyticsData;
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook لتقرير استخدام المستخدمين
 */
export function useUserUsageReportNew() {
  const { firebaseUser } = useAuth();

  return useQuery<UsageReport[]>({
    queryKey: ['user-usage-report'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await analyticsService.getUserUsageReport(token, {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          limit: 100,
          sortBy: 'usage'
        });

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

        if (legacyResult.success) {
          return legacyResult.data as UsageReport[];
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook لتحليلات الوكلاء
 */
export function useAgentAnalyticsNew() {
  const { firebaseUser } = useAuth();

  return useQuery<AgentAnalytics[]>({
    queryKey: ['agent-analytics'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await analyticsUtils.getAgentAnalyticsWithErrorHandling(token, {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

        if (legacyResult.success) {
          return legacyResult.data as AgentAnalytics[];
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 20, // 20 minutes
  });
}

// === Hooks العمليات ===

/**
 * Hook لتصدير تقرير الاستخدام
 */
export function useExportUsageReportNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExportReportData) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await analyticsUtils.exportUsageReportWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تصدير التقرير",
        description: "تم تصدير تقرير الاستخدام بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تصدير التقرير",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لإنشاء تقرير مخصص
 */
export function useCreateCustomReportNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CustomReportData) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await analyticsUtils.createCustomReportWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء التقرير المخصص",
        description: "تم إنشاء التقرير المخصص بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إنشاء التقرير المخصص",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook للحصول على مقاييس الأداء
 */
export function usePerformanceMetricsNew() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await analyticsUtils.getPerformanceMetricsWithErrorHandling(token, {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          metric: 'response_time'
        });

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.analytics.fetchUserStats(token);

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

// === Hooks للواجهات ===

/**
 * Hook للتحليلات المتقدمة
 */
export function useAdvancedAnalyticsNew() {
  const userStatsQuery = useUserStatsNew();
  const systemStatsQuery = useSystemStatsNew();
  const usageAnalyticsQuery = useUsageAnalyticsNew();
  const userUsageReportQuery = useUserUsageReportNew();
  const agentAnalyticsQuery = useAgentAnalyticsNew();
  const performanceMetricsQuery = usePerformanceMetricsNew();

  const exportReportMutation = useExportUsageReportNew();
  const createCustomReportMutation = useCreateCustomReportNew();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d' | '90d' | '1y'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'projects' | 'credits' | 'usage'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTimeRangeChange = (range: '1d' | '7d' | '30d' | '90d' | '1y') => {
    setSelectedTimeRange(range);
  };

  const handleMetricChange = (metric: 'all' | 'projects' | 'credits' | 'usage') => {
    setSelectedMetric(metric);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // إعادة تحميل جميع الاستعلامات
    Promise.all([
      userStatsQuery.refetch(),
      systemStatsQuery.refetch(),
      usageAnalyticsQuery.refetch(),
      userUsageReportQuery.refetch(),
      agentAnalyticsQuery.refetch(),
      performanceMetricsQuery.refetch()
    ]).finally(() => {
      setIsRefreshing(false);
    });
  };

  const handleExportData = (data: ExportReportData) => {
    exportReportMutation.mutate(data);
  };

  const handleCreateCustomReport = (data: CustomReportData) => {
    createCustomReportMutation.mutate(data);
  };

  return {
    // البيانات
    userStats: userStatsQuery.data,
    systemStats: systemStatsQuery.data,
    usageAnalytics: usageAnalyticsQuery.data,
    userUsageReport: userUsageReportQuery.data,
    agentAnalytics: agentAnalyticsQuery.data,
    performanceMetrics: performanceMetricsQuery.data,

    // حالة التحميل
    isLoading: userStatsQuery.isLoading || systemStatsQuery.isLoading || usageAnalyticsQuery.isLoading,
    isError: userStatsQuery.isError || systemStatsQuery.isError || usageAnalyticsQuery.isError,
    error: userStatsQuery.error || systemStatsQuery.error || usageAnalyticsQuery.error,

    // الحالة المحلية
    selectedTimeRange,
    selectedMetric,
    isRefreshing,

    // الطرق
    handleTimeRangeChange,
    handleMetricChange,
    handleRefresh,
    handleExportData,
    handleCreateCustomReport,

    // حالة الطفرات
    isExporting: exportReportMutation.isPending,
    isCreatingCustomReport: createCustomReportMutation.isPending,

    // النتائج
    exportResult: exportReportMutation.data,
    customReportResult: createCustomReportMutation.data,
  };
}

/**
 * Hook لواجهة التحليلات المبسطة
 */
export function useSimpleAnalyticsNew() {
  const userStatsQuery = useUserStatsNew();
  const systemStatsQuery = useSystemStatsNew();

  return {
    // البيانات الأساسية
    userStats: userStatsQuery.data,
    systemStats: systemStatsQuery.data,

    // حالة التحميل
    isLoading: userStatsQuery.isLoading || systemStatsQuery.isLoading,
    isError: userStatsQuery.isError || systemStatsQuery.isError,
    error: userStatsQuery.error || systemStatsQuery.error,

    // الطرق
    refetch: () => {
      userStatsQuery.refetch();
      systemStatsQuery.refetch();
    },
  };
}
