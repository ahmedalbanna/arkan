/**
 * خدمات التحليلات والإحصائيات المبسطة
 *
 * نظام مبسط لإدارة التحليلات والإحصائيات
 */

import { api } from './simple-service';

// أنواع البيانات
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

// خدمات التحليلات والإحصائيات المبسطة
export const analyticsService = {
  // === إحصائيات المستخدم ===

  // الحصول على إحصائيات لوحة تحكم المستخدم
  async getUserStats(token: string) {
    return api.get<UserDashboardStats>('/analytics/user-stats', { token });
  },

  // الحصول على إحصائيات الاستخدام للمستخدم
  async getUserUsageStats(token: string, params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

    const queryString = queryParams.toString();
    const path = queryString ? `/analytics/user-usage?${queryString}` : '/analytics/user-usage';

    return api.get<AnalyticsData>(path, { token });
  },

  // === إحصائيات النظام ===

  // الحصول على إحصائيات النظام العامة
  async getSystemStats(token: string) {
    return api.get<SystemMetrics>('/analytics/system-stats', { token });
  },

  // الحصول على إحصائيات الاستخدام العامة
  async getUsageAnalytics(token: string, params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

    const queryString = queryParams.toString();
    const path = queryString ? `/analytics/usage?${queryString}` : '/analytics/usage';

    return api.get<AnalyticsData>(path, { token });
  },

  // === تقارير الاستخدام ===

  // الحصول على تقرير استخدام المستخدمين
  async getUserUsageReport(token: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    sortBy?: 'usage' | 'credits' | 'activity';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const queryString = queryParams.toString();
    const path = queryString ? `/analytics/user-report?${queryString}` : '/analytics/user-report';

    return api.get<UsageReport[]>(path, { token });
  },

  // تصدير تقرير الاستخدام
  async exportUsageReport(data: {
    startDate: string;
    endDate: string;
    format: 'pdf' | 'xlsx' | 'csv';
    includeUsers?: boolean;
    includeAgents?: boolean;
  }, token: string) {
    return api.post<{ downloadUrl: string }>('/analytics/export-report', data, { token });
  },

  // === تحليلات الوكلاء ===

  // الحصول على تحليلات الوكلاء
  async getAgentAnalytics(token: string, params?: {
    agentId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.agentId) queryParams.append('agentId', params.agentId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const path = queryString ? `/analytics/agents?${queryString}` : '/analytics/agents';

    return api.get<AgentAnalytics[]>(path, { token });
  },

  // الحصول على إحصائيات وكيل محدد
  async getAgentStats(agentId: string, token: string, params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const path = queryString ? `/analytics/agents/${agentId}/stats?${queryString}` : `/analytics/agents/${agentId}/stats`;

    return api.get<AgentAnalytics>(path, { token });
  },

  // === مقاييس الأداء ===

  // الحصول على مقاييس الأداء
  async getPerformanceMetrics(token: string, params?: {
    startDate?: string;
    endDate?: string;
    metric?: 'response_time' | 'success_rate' | 'error_rate' | 'throughput';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.metric) queryParams.append('metric', params.metric);

    const queryString = queryParams.toString();
    const path = queryString ? `/analytics/performance?${queryString}` : '/analytics/performance';

    return api.get<any>(path, { token });
  },

  // الحصول على إحصائيات الأخطاء
  async getErrorStats(token: string, params?: {
    startDate?: string;
    endDate?: string;
    errorType?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.errorType) queryParams.append('errorType', params.errorType);

    const queryString = queryParams.toString();
    const path = queryString ? `/analytics/errors?${queryString}` : '/analytics/errors';

    return api.get<any>(path, { token });
  },

  // === التقارير المخصصة ===

  // إنشاء تقرير مخصص
  async createCustomReport(data: {
    name: string;
    description?: string;
    metrics: string[];
    filters: any;
    schedule?: 'daily' | 'weekly' | 'monthly';
  }, token: string) {
    return api.post<{ reportId: string }>('/analytics/custom-reports', data, { token });
  },

  // الحصول على التقارير المخصصة
  async getCustomReports(token: string) {
    return api.get<any[]>('/analytics/custom-reports', { token });
  },

  // تشغيل تقرير مخصص
  async runCustomReport(reportId: string, token: string) {
    return api.post<{ data: any }>(`/analytics/custom-reports/${reportId}/run`, {}, { token });
  },

  // === إعدادات التحليلات ===

  // تحديث إعدادات التحليلات
  async updateAnalyticsSettings(settings: {
    dataRetentionDays?: number;
    enableRealTimeTracking?: boolean;
    enableUserTracking?: boolean;
    enablePerformanceMonitoring?: boolean;
  }, token: string) {
    return api.put<{ message: string }>('/analytics/settings', settings, { token });
  },

  // الحصول على إعدادات التحليلات
  async getAnalyticsSettings(token: string) {
    return api.get<any>('/analytics/settings', { token });
  },
};

// دوال مساعدة للتحليلات والإحصائيات
export const analyticsUtils = {
  // الحصول على إحصائيات المستخدم مع معالجة الأخطاء
  async getUserStatsWithErrorHandling(token: string) {
    try {
      const result = await analyticsService.getUserStats(token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user stats'
      };
    }
  },

  // الحصول على إحصائيات النظام مع معالجة الأخطاء
  async getSystemStatsWithErrorHandling(token: string) {
    try {
      const result = await analyticsService.getSystemStats(token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get system stats'
      };
    }
  },

  // الحصول على تحليلات الوكلاء مع معالجة الأخطاء
  async getAgentAnalyticsWithErrorHandling(token: string, params?: {
    agentId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const result = await analyticsService.getAgentAnalytics(token, params);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get agent analytics'
      };
    }
  },

  // تصدير تقرير الاستخدام مع معالجة الأخطاء
  async exportUsageReportWithErrorHandling(data: {
    startDate: string;
    endDate: string;
    format: 'pdf' | 'xlsx' | 'csv';
    includeUsers?: boolean;
    includeAgents?: boolean;
  }, token: string) {
    try {
      const result = await analyticsService.exportUsageReport(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export usage report'
      };
    }
  },

  // الحصول على مقاييس الأداء مع معالجة الأخطاء
  async getPerformanceMetricsWithErrorHandling(token: string, params?: {
    startDate?: string;
    endDate?: string;
    metric?: 'response_time' | 'success_rate' | 'error_rate' | 'throughput';
  }) {
    try {
      const result = await analyticsService.getPerformanceMetrics(token, params);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance metrics'
      };
    }
  },

  // إنشاء تقرير مخصص مع معالجة الأخطاء
  async createCustomReportWithErrorHandling(data: {
    name: string;
    description?: string;
    metrics: string[];
    filters: any;
    schedule?: 'daily' | 'weekly' | 'monthly';
  }, token: string) {
    try {
      const result = await analyticsService.createCustomReport(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create custom report'
      };
    }
  },

  // === دوال مساعدة إضافية ===

  // تنسيق الرقم للعرض
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // تنسيق النسبة المئوية
  formatPercentage(value: number, total: number): string {
    const percentage = (value / total) * 100;
    return percentage.toFixed(1) + '%';
  },

  // تنسيق الوقت
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}س ${minutes % 60}د`;
    } else if (minutes > 0) {
      return `${minutes}د ${seconds % 60}ث`;
    } else {
      return `${seconds}ث`;
    }
  },

  // حساب معدل النمو
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // تنسيق معدل النمو
  formatGrowthRate(growthRate: number): string {
    const sign = growthRate >= 0 ? '+' : '';
    return `${sign}${growthRate.toFixed(1)}%`;
  },

  // إنشاء مخطط بيانات
  createChartData(data: { name: string; value: number }[], maxItems: number = 10) {
    return data
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems)
      .map(item => ({
        name: item.name,
        count: item.value
      }));
  },

  // حساب المتوسط المتحرك
  calculateMovingAverage(data: number[], windowSize: number = 7): number[] {
    const result: number[] = [];
    for (let i = windowSize - 1; i < data.length; i++) {
      const sum = data.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / windowSize);
    }
    return result;
  },
};
