/**
 * خدمة التحليل والإحصائيات - Services v2.0
 *
 * خدمة محسنة للتحليل والإحصائيات للمستخدمين مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

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

export interface SystemAnalytics {
    totalUsers: number;
    activeUsers: number;
    totalGenerations: number;
    totalCreditsUsed: number;
    averageSessionDuration: number;
    topAgents: Array<{
        agentId: string;
        agentName: string;
        usageCount: number;
        averageQuality: number;
    }>;
    dailyStats: Array<{
        date: string;
        users: number;
        generations: number;
        credits: number;
    }>;
}

export interface GenerationAnalytics {
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageQuality: number;
    averageGenerationTime: number;
    generationByType: Record<string, number>;
    qualityDistribution: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
    };
}

export class AnalyticsServiceV2 extends BaseService {
    constructor() {
        super('AnalyticsServiceV2');
    }

    /**
     * جلب إحصائيات لوحة تحكم المستخدم مع مراقبة الأداء
     */
    async fetchUserStats(token: string): Promise<UserDashboardStats> {
        const operationId = this.startOperation('fetchUserStats');

        try {
            const response = await fetch('/api/analytics/user-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch user analytics');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchUserStats');
            throw error;
        }
    }

    /**
     * جلب إحصائيات النظام مع مراقبة شاملة
     */
    async fetchSystemAnalytics(token: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<SystemAnalytics> {
        const operationId = this.startOperation('fetchSystemAnalytics');

        try {
            const response = await fetch(`/api/analytics/system?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch system analytics');
            }

            const analytics = await response.json();
            this.endOperation(operationId, { success: true });
            return analytics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchSystemAnalytics');
            throw error;
        }
    }

    /**
     * جلب إحصائيات التوليد مع مراقبة الأداء
     */
    async fetchGenerationAnalytics(token: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<GenerationAnalytics> {
        const operationId = this.startOperation('fetchGenerationAnalytics');

        try {
            const response = await fetch(`/api/analytics/generations?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch generation analytics');
            }

            const analytics = await response.json();
            this.endOperation(operationId, { success: true });
            return analytics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchGenerationAnalytics');
            throw error;
        }
    }

    /**
     * جلب إحصائيات المستخدمين مع مراقبة شاملة
     */
    async fetchUserAnalytics(token: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        newUsers: number;
        activeUsers: number;
        returningUsers: number;
        userGrowth: number;
        userRetention: number;
        averageSessionDuration: number;
        topCountries: Array<{
            country: string;
            users: number;
            percentage: number;
        }>;
    }> {
        const operationId = this.startOperation('fetchUserAnalytics');

        try {
            const response = await fetch(`/api/analytics/users?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user analytics');
            }

            const analytics = await response.json();
            this.endOperation(operationId, { success: true });
            return analytics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchUserAnalytics');
            throw error;
        }
    }

    /**
     * جلب إحصائيات الجودة مع مراقبة الأداء
     */
    async fetchQualityAnalytics(token: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        averageQuality: number;
        qualityTrend: Array<{
            date: string;
            score: number;
            sampleSize: number;
        }>;
        qualityDistribution: {
            excellent: number;
            good: number;
            fair: number;
            poor: number;
        };
        improvementRate: number;
        topSectionsByQuality: Array<{
            section: string;
            averageQuality: number;
            generations: number;
        }>;
    }> {
        const operationId = this.startOperation('fetchQualityAnalytics');

        try {
            const response = await fetch(`/api/analytics/quality?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch quality analytics');
            }

            const analytics = await response.json();
            this.endOperation(operationId, { success: true });
            return analytics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchQualityAnalytics');
            throw error;
        }
    }

    /**
     * جلب إحصائيات الاستخدام مع مراقبة شاملة
     */
    async fetchUsageAnalytics(token: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalRequests: number;
        apiCalls: number;
        averageResponseTime: number;
        errorRate: number;
        usageByHour: Array<{
            hour: number;
            requests: number;
        }>;
        topEndpoints: Array<{
            endpoint: string;
            requests: number;
            averageTime: number;
        }>;
    }> {
        const operationId = this.startOperation('fetchUsageAnalytics');

        try {
            const response = await fetch(`/api/analytics/usage?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch usage analytics');
            }

            const analytics = await response.json();
            this.endOperation(operationId, { success: true });
            return analytics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchUsageAnalytics');
            throw error;
        }
    }

    /**
     * جلب تقرير تحليلي شامل مع مراقبة الأداء
     */
    async fetchAnalyticsReport(
        token: string,
        reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
        startDate?: string,
        endDate?: string
    ): Promise<{
        summary: {
            totalUsers: number;
            totalGenerations: number;
            totalCreditsUsed: number;
            averageQuality: number;
        };
        performance: {
            averageResponseTime: number;
            errorRate: number;
            uptime: number;
        };
        trends: {
            userGrowth: Array<{ date: string; users: number }>;
            generationTrends: Array<{ date: string; generations: number }>;
            qualityTrends: Array<{ date: string; score: number }>;
        };
        insights: string[];
        recommendations: string[];
        generatedAt: string;
    }> {
        const operationId = this.startOperation('fetchAnalyticsReport');

        try {
            const queryParams = new URLSearchParams({
                reportType,
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            });

            const response = await fetch(`/api/analytics/report?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics report');
            }

            const report = await response.json();
            this.endOperation(operationId, { success: true });
            return report;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchAnalyticsReport');
            throw error;
        }
    }

    /**
     * تصدير بيانات التحليلات مع مراقبة شاملة
     */
    async exportAnalytics(
        token: string,
        format: 'csv' | 'json' | 'excel',
        filters: {
            startDate?: string;
            endDate?: string;
            dataType?: 'users' | 'generations' | 'quality' | 'usage';
        } = {}
    ): Promise<{
        format: string;
        data: string;
        filename: string;
        recordCount: number;
    }> {
        const operationId = this.startOperation('exportAnalytics');

        try {
            const queryParams = new URLSearchParams({ format });

            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });

            const response = await fetch(`/api/analytics/export?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export analytics');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, format, recordCount: result.recordCount });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.exportAnalytics');
            throw error;
        }
    }

    /**
     * جلب إحصائيات في الوقت الفعلي مع مراقبة الأداء
     */
    async fetchRealtimeAnalytics(token: string): Promise<{
        activeUsers: number;
        currentGenerations: number;
        systemLoad: number;
        errorCount: number;
        recentActivity: Array<{
            userId: string;
            action: string;
            timestamp: string;
        }>;
    }> {
        const operationId = this.startOperation('fetchRealtimeAnalytics');

        try {
            const response = await fetch('/api/analytics/realtime', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch realtime analytics');
            }

            const analytics = await response.json();
            this.endOperation(operationId, { success: true });
            return analytics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchRealtimeAnalytics');
            throw error;
        }
    }

    /**
     * جلب إحصائيات مقارنة مع مراقبة شاملة
     */
    async fetchComparisonAnalytics(
        token: string,
        compareWith: 'previous_period' | 'custom_range',
        startDate?: string,
        endDate?: string
    ): Promise<{
        currentPeriod: {
            users: number;
            generations: number;
            quality: number;
            creditsUsed: number;
        };
        previousPeriod: {
            users: number;
            generations: number;
            quality: number;
            creditsUsed: number;
        };
        changes: {
            userGrowth: number;
            generationGrowth: number;
            qualityChange: number;
            creditUsageChange: number;
        };
        insights: string[];
    }> {
        const operationId = this.startOperation('fetchComparisonAnalytics');

        try {
            const response = await fetch('/api/analytics/comparison', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    compareWith,
                    startDate,
                    endDate
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch comparison analytics');
            }

            const analytics = await response.json();
            this.endOperation(operationId, { success: true });
            return analytics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchComparisonAnalytics');
            throw error;
        }
    }

    /**
     * جلب توصيات التحسين بناءً على البيانات مع مراقبة الأداء
     */
    async fetchImprovementRecommendations(token: string): Promise<{
        recommendations: Array<{
            category: 'performance' | 'quality' | 'usability' | 'features';
            title: string;
            description: string;
            priority: 'high' | 'medium' | 'low';
            expectedImpact: string;
            implementationEffort: 'low' | 'medium' | 'high';
        }>;
        summary: {
            totalRecommendations: number;
            highPriorityCount: number;
            implementationScore: number;
        };
    }> {
        const operationId = this.startOperation('fetchImprovementRecommendations');

        try {
            const response = await fetch('/api/analytics/improvement-recommendations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch improvement recommendations');
            }

            const recommendations = await response.json();
            this.endOperation(operationId, { success: true, recommendationCount: recommendations.recommendations?.length || 0 });
            return recommendations;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.fetchImprovementRecommendations');
            throw error;
        }
    }

    /**
     * فحص صحة نظام التحليلات مع مراقبة شاملة
     */
    async checkAnalyticsHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        dataFreshness: number; // minutes
        lastUpdate: string;
        dataSources: Array<{
            name: string;
            status: 'connected' | 'disconnected' | 'error';
            lastSync?: string;
        }>;
    }> {
        const operationId = this.startOperation('checkAnalyticsHealth');

        try {
            const response = await fetch('/api/analytics/health', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Analytics health check failed');
            }

            const health = await response.json();
            this.endOperation(operationId, { success: true, status: health.status });
            return health;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AnalyticsServiceV2.checkAnalyticsHealth');
            throw error;
        }
    }
}