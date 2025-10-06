/**
 * خدمة تحليلات المستخدمين - Services v2.0
 *
 * خدمة محسنة لتحليلات المستخدمين للأداء والمستخدمين والجودة مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface SystemEvent {
    id: string;
    type: 'report_generation' | 'quality_improvement' | 'cache_hit' | 'section_generation' | 'user_action';
    userId?: string;
    sessionId: string;
    timestamp: Date;
    data: Record<string, any>;
    performance: {
        duration: number;
        memoryUsage?: number;
        cpuUsage?: number;
    };
}

export interface QualityTrend {
    date: string;
    averageQuality: number;
    sectionQualities: Record<string, number>;
    improvements: number;
    degradations: number;
}

export interface UsagePattern {
    userId: string;
    sessionCount: number;
    mostUsedSections: Array<{
        section: string;
        frequency: number;
        averageQuality: number;
        averageTime: number;
    }>;
    preferredModes: {
        intelligent: number;
        traditional: number;
        hybrid: number;
    };
    peakUsageHours: number[];
    averageSessionDuration: number;
    qualityImprovement: number;
}

export interface PerformanceMetrics {
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    activeUsers: number;
    memoryUsage: number;
    cpuUsage: number;
}

export class UserAnalyticsServiceV2 extends BaseService {
    constructor() {
        super('UserAnalyticsServiceV2');
    }

    /**
     * تسجيل حدث نظام مع مراقبة الأداء
     */
    async logSystemEvent(event: Omit<SystemEvent, 'id' | 'timestamp'>): Promise<void> {
        const operationId = this.startOperation('logSystemEvent');

        try {
            const response = await fetch('/api/analytics/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...event,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to log system event');
            }

            this.endOperation(operationId, { success: true, eventType: event.type });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.logSystemEvent');
            // لا نرمي خطأ هنا لتجنب تعطيل الوظيفة الرئيسية
        }
    }

    /**
     * جلب أحدث الأحداث مع مراقبة شاملة
     */
    async getRecentEvents(token?: string, limit: number = 50): Promise<SystemEvent[]> {
        const operationId = this.startOperation('getRecentEvents');

        try {
            const response = await fetch(`/api/analytics/events/recent?limit=${limit}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recent events');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, eventCount: result.events?.length || 0 });
            return result.events || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getRecentEvents');
            throw error;
        }
    }

    /**
     * جلب اتجاهات الجودة مع مراقبة الأداء
     */
    async getQualityTrends(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<QualityTrend[]> {
        const operationId = this.startOperation('getQualityTrends');

        try {
            const response = await fetch(`/api/analytics/quality-trends?range=${timeRange}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch quality trends');
            }

            const trends = await response.json();
            this.endOperation(operationId, { success: true, trendCount: trends.length });
            return trends;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getQualityTrends');
            throw error;
        }
    }

    /**
     * جلب أنماط استخدام المستخدمين مع مراقبة شاملة
     */
    async getUsagePatterns(userId?: string): Promise<UsagePattern[]> {
        const operationId = this.startOperation('getUsagePatterns');

        try {
            const queryParams = userId ? `?userId=${userId}` : '';
            const response = await fetch(`/api/analytics/usage-patterns${queryParams}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch usage patterns');
            }

            const patterns = await response.json();
            this.endOperation(operationId, { success: true, patternCount: patterns.length });
            return patterns;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getUsagePatterns');
            throw error;
        }
    }

    /**
     * جلب مقاييس الأداء مع مراقبة الأداء
     */
    async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        const operationId = this.startOperation('getPerformanceMetrics');

        try {
            const response = await fetch('/api/analytics/performance-metrics', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance metrics');
            }

            const metrics = await response.json();
            this.endOperation(operationId, { success: true });
            return metrics;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getPerformanceMetrics');
            throw error;
        }
    }

    /**
     * جلب إحصائيات استخدام الأقسام مع مراقبة شاملة
     */
    async getSectionUsageStats(timeRange: 'day' | 'week' | 'month' = 'month'): Promise<Array<{
        sectionName: string;
        usageCount: number;
        averageQuality: number;
        averageTime: number;
        uniqueUsers: number;
        successRate: number;
    }>> {
        const operationId = this.startOperation('getSectionUsageStats');

        try {
            const response = await fetch(`/api/analytics/section-usage?range=${timeRange}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch section usage stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: stats.length });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getSectionUsageStats');
            throw error;
        }
    }

    /**
     * جلب إحصائيات المستخدمين النشطين مع مراقبة الأداء
     */
    async getActiveUsersStats(timeRange: 'day' | 'week' | 'month' = 'day'): Promise<{
        totalUsers: number;
        activeUsers: number;
        newUsers: number;
        returningUsers: number;
        userEngagement: {
            averageSessionsPerUser: number;
            averageSessionDuration: number;
            bounceRate: number;
        };
        demographics: {
            newUserPercentage: number;
            returningUserPercentage: number;
        };
    }> {
        const operationId = this.startOperation('getActiveUsersStats');

        try {
            const response = await fetch(`/api/analytics/active-users?range=${timeRange}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch active users stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getActiveUsersStats');
            throw error;
        }
    }

    /**
     * جلب إحصائيات جودة التوليد مع مراقبة شاملة
     */
    async getGenerationQualityStats(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        averageQualityScore: number;
        qualityDistribution: {
            excellent: number; // 90-100
            good: number; // 75-89
            fair: number; // 60-74
            poor: number; // < 60
        };
        improvementRate: number;
        topSectionsByQuality: Array<{
            sectionName: string;
            averageQuality: number;
            sampleSize: number;
        }>;
        qualityTrends: Array<{
            date: string;
            averageScore: number;
            sampleSize: number;
        }>;
    }> {
        const operationId = this.startOperation('getGenerationQualityStats');

        try {
            const response = await fetch(`/api/analytics/generation-quality?range=${timeRange}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch generation quality stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getGenerationQualityStats');
            throw error;
        }
    }

    /**
     * جلب تقرير تحليلي شامل مع مراقبة الأداء
     */
    async getAnalyticsReport(
        reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
        startDate?: string,
        endDate?: string
    ): Promise<{
        summary: {
            totalEvents: number;
            uniqueUsers: number;
            averageQuality: number;
            topFeatures: string[];
        };
        performance: PerformanceMetrics;
        quality: {
            trends: QualityTrend[];
            distribution: Record<string, number>;
        };
        usage: {
            patterns: UsagePattern[];
            sectionStats: Array<{
                section: string;
                usage: number;
                quality: number;
            }>;
        };
        recommendations: string[];
        generatedAt: string;
    }> {
        const operationId = this.startOperation('getAnalyticsReport');

        try {
            const queryParams = new URLSearchParams({
                reportType,
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            });

            const response = await fetch(`/api/analytics/report?${queryParams.toString()}`, {
                headers: {
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
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getAnalyticsReport');
            throw error;
        }
    }

    /**
     * تصدير بيانات التحليلات مع مراقبة شاملة
     */
    async exportAnalyticsData(
        format: 'csv' | 'json' | 'excel',
        filters: {
            startDate?: string;
            endDate?: string;
            eventTypes?: string[];
            userIds?: string[];
        } = {}
    ): Promise<{
        format: string;
        data: string;
        filename: string;
        recordCount: number;
    }> {
        const operationId = this.startOperation('exportAnalyticsData');

        try {
            const queryParams = new URLSearchParams({ format });

            Object.entries(filters).forEach(([key, value]) => {
                if (value && Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else if (value) {
                    queryParams.append(key, value);
                }
            });

            const response = await fetch(`/api/analytics/export?${queryParams.toString()}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export analytics data');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, format, recordCount: result.recordCount });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.exportAnalyticsData');
            throw error;
        }
    }

    /**
     * جلب توصيات التحسين بناءً على البيانات مع مراقبة الأداء
     */
    async getImprovementRecommendations(): Promise<{
        priority: 'high' | 'medium' | 'low';
        category: 'performance' | 'quality' | 'usability' | 'features';
        title: string;
        description: string;
        expectedImpact: string;
        implementationEffort: 'low' | 'medium' | 'high';
        data: Record<string, any>;
    }[]> {
        const operationId = this.startOperation('getImprovementRecommendations');

        try {
            const response = await fetch('/api/analytics/improvement-recommendations', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch improvement recommendations');
            }

            const recommendations = await response.json();
            this.endOperation(operationId, { success: true, recommendationCount: recommendations.length });
            return recommendations;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'UserAnalyticsServiceV2.getImprovementRecommendations');
            throw error;
        }
    }
}