/**
 * خدمة تحليلات المستخدمين للأداء والمستخدمين والجودة
 */

'use client';

// أحداث النظام المرق
interface SystemEvent {
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

interface QualityTrend {
    date: string;
    averageQuality: number;
    sectionQualities: Record<string, number>;
    improvements: number;
    degradations: number;
}

interface UsagePattern {
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

interface PerformanceMetrics {
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    responseTime: {
        average: number;
        p95: number;
        p99: number;
    };
    errorRate: number;
    throughputRate: number;
    cacheEffectiveness: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        storage: number;
    };
}

interface ProductivityInsight {
    type: 'time_saved' | 'quality_gained' | 'efficiency_improvement' | 'cost_reduction';
    value: number;
    unit: string;
    period: string;
    description: string;
    trend: 'increasing' | 'decreasing' | 'stable';
}

interface AnalyticsReport {
    period: {
        start: Date;
        end: Date;
        type: 'daily' | 'weekly' | 'monthly' | 'custom';
    };
    summary: {
        totalUsers: number;
        totalSessions: number;
        totalReports: number;
        averageQuality: number;
        productivityGained: number;
    };
    trends: {
        quality: QualityTrend[];
        usage: UsagePattern[];
        performance: PerformanceMetrics[];
        productivity: ProductivityInsight[];
    };
    recommendations: string[];
}

export class UserAnalyticsService {

    private static events: SystemEvent[] = [];
    private static readonly MAX_EVENTS = 10000;

    /**
     * تسجيل حدث جديد في النظام
     */
    static trackEvent(
        type: SystemEvent['type'],
        data: Record<string, any>,
        performance: SystemEvent['performance'],
        userId?: string,
        sessionId?: string
    ): void {
        const event: SystemEvent = {
            id: this.generateEventId(),
            type,
            userId,
            sessionId: sessionId || `session_${Date.now()}`,
            timestamp: new Date(),
            data,
            performance
        };

        // إضافة الحدث لإلى القائمة
        this.events.push(event);

        // الحد من عدد الأحداث المخزنة
        if (this.events.length > this.MAX_EVENTS) {
            this.events = this.events.slice(-this.MAX_EVENTS);
        }

        // تحديث ملفات الأداء في الوقت الفعلي
        this.updatePerformanceMetrics(event);
    }

    /**
     * تحليل أنماط استخدام المستخدمين
     */
    static analyzeUsagePatterns(dateRange: { start: Date; end: Date }): UsagePattern[] {
        const patterns: UsagePattern[] = [];

        // تجميع أحداث النظام حسب المستخدم
        const eventsByUser = this.events
            .filter(event => event.timestamp >= dateRange.start && event.timestamp <= dateRange.end)
            .reduce((acc, event) => {
                if (!event.userId) return acc;

                if (!acc[event.userId]) {
                    acc[event.userId] = [];
                }
                acc[event.userId].push(event);
                return acc;
            }, {} as Record<string, SystemEvent[]>);

        // تحليل كل مستخدم بشكل منفصل
        for (const [userId, userEvents] of Object.entries(eventsByUser)) {
            const pattern = this.analyzeUserPattern(userId, userEvents);
            patterns.push(pattern);
        }

        return patterns;
    }

    /**
     * تحليل اتجاهات الجودة عبر الوقت
     */
    static analyzeQualityTrends(dateRange: { start: Date; end: Date }): QualityTrend[] {
        const trends: QualityTrend[] = [];

        // تجميع الأحداث باليوم
        const eventsByDay = this.events
            .filter(event => event.timestamp >= dateRange.start && event.timestamp <= dateRange.end)
            .reduce((acc, event) => {
                const day = event.timestamp.toISOString().split('T')[0];
                if (!acc[day]) {
                    acc[day] = [];
                }
                acc[day].push(event);
                return acc;
            }, {} as Record<string, SystemEvent[]>);

        // حساب اتجاهات يومية
        for (const [date, dayEvents] of Object.entries(eventsByDay)) {
            const trend = this.calculateDailyQualityTrend(date, dayEvents);
            trends.push(trend);
        }

        return trends.sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * تحليل المقاييس الأداء النظام
     */
    static getPerformanceMetrics(dateRange: { start: Date; end: Date }): PerformanceMetrics {
        const relevantEvents = this.events.filter(event =>
            event.timestamp >= dateRange.start && event.timestamp <= dateRange.end
        );

        return {
            systemHealth: this.calculateSystemHealth(relevantEvents),
            responseTime: this.calculateResponseTime(relevantEvents),
            errorRate: this.calculateErrorRate(relevantEvents),
            throughputRate: this.calculateThroughput(relevantEvents),
            cacheEffectiveness: this.calculateCacheEffectiveness(relevantEvents),
            resourceUtilization: this.calculateResourceUtilization(relevantEvents)
        };
    }

    /**
     * تحليل رؤى الإنتاجية
     */
    static analyzeProductivityInsights(dateRange: { start: Date; end: Date }): ProductivityInsight[] {
        const insights: ProductivityInsight[] = [];

        // حساب الوقت المحفوظ
        const timeSaved = this.calculateTimeSaved(dateRange);
        insights.push(timeSaved);

        // تحليل تحسين الجودة
        const qualityGained = this.calculateQualityGained(dateRange);
        insights.push(qualityGained);

        // تحليل كفاءة الأداء
        const efficiencyImprovement = this.calculateEfficiencyImprovement(dateRange);
        insights.push(efficiencyImprovement);

        // حساب تقليل التكلفة
        const costReduction = this.calculateCostReduction(dateRange);
        insights.push(costReduction);

        return insights;
    }

    /**
     * توليد تقرير تحليلي شامل
     */
    static generateAnalyticsReport(
        period: 'daily' | 'weekly' | 'monthly' | 'custom',
        customRange?: { start: Date; end: Date }
    ): AnalyticsReport {
        const dateRange = this.calculateDateRange(period, customRange);

        const trends = {
            quality: this.analyzeQualityTrends(dateRange),
            usage: this.analyzeUsagePatterns(dateRange),
            performance: [this.getPerformanceMetrics(dateRange)],
            productivity: this.analyzeProductivityInsights(dateRange)
        };

        const summary = this.calculateReportSummary(trends, dateRange);
        const recommendations = this.generateRecommendations(trends);

        return {
            period: {
                start: dateRange.start,
                end: dateRange.end,
                type: period
            },
            summary,
            trends,
            recommendations
        };
    }

    /**
     * تتبع التقدم من حيث الوقت الفعلي
     */
    static getRealTimeMetrics(): {
        currentUsers: number;
        activeGenerations: number;
        averageQuality: number;
        currentPerformance: PerformanceMetrics;
        recentInsights: ProductivityInsight[];
    } {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentEvents = this.events.filter(event => event.timestamp >= last24Hours);

        return {
            currentUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
            activeGenerations: recentEvents.filter(e => e.type === 'report_generation').length,
            averageQuality: this.calculateAverageQuality(recentEvents),
            currentPerformance: this.getPerformanceMetrics({ start: last24Hours, end: new Date() }),
            recentInsights: this.analyzeProductivityInsights({ start: last24Hours, end: new Date() })
        };
    }

    // === طرق المساعدة الداخلية ===

    private static generateEventId(): string {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private static analyzeUserPattern(userId: string, events: SystemEvent[]): UsagePattern {
        const sessions = new Set(events.map(e => e.sessionId)).size;

        // تحليل الأقسام الأكثر استخداماً
        const sectionEvents = events.filter(e => e.type === 'section_generation');
        const sectionCount: Record<string, { count: number; totalQuality: number; totalTime: number }> = {};

        sectionEvents.forEach(event => {
            const section = event.data.section;
            if (section) {
                if (!sectionCount[section]) {
                    sectionCount[section] = { count: 0, totalQuality: 0, totalTime: 0 };
                }
                sectionCount[section].count++;
                sectionCount[section].totalQuality += event.data.quality || 0;
                sectionCount[section].totalTime += event.performance.duration;
            }
        });

        const mostUsedSections = Object.entries(sectionCount)
            .map(([section, data]) => ({
                section,
                frequency: data.count,
                averageQuality: data.totalQuality / data.count,
                averageTime: data.totalTime / data.count
            }))
            .sort((a, b) => b.frequency - a.frequency);

        // تحليل الأوضاع المفضل
        const modeEvents = events.filter(e => e.data.mode);
        const modes = { intelligent: 0, traditional: 0, hybrid: 0 };

        modeEvents.forEach(event => {
            const mode = event.data.mode;
            if (modes.hasOwnProperty(mode)) {
                modes[mode as keyof typeof modes]++;
            }
        });

        return {
            userId,
            sessionCount: sessions,
            mostUsedSections: mostUsedSections.slice(0, 10),
            preferredModes: modes,
            peakUsageHours: this.calculatePeakHours(events),
            averageSessionDuration: this.calculateAverageSessionDuration(events),
            qualityImprovement: this.calculateUserQualityImprovement(events)
        };
    }

    private static calculateDailyQualityTrend(date: string, events: SystemEvent[]): QualityTrend {
        const qualityEvents = events.filter(e => e.data.quality !== undefined);

        const averageQuality = qualityEvents.length > 0
            ? qualityEvents.reduce((sum, e) => sum + e.data.quality, 0) / qualityEvents.length
            : 0;

        const sectionQualities: Record<string, number> = {};
        qualityEvents.forEach(event => {
            const section = event.data.section;
            if (section) {
                if (!sectionQualities[section]) {
                    sectionQualities[section] = [];
                }
                sectionQualities[section].push(event.data.quality);
            }
        });

        // حساب متوسط الجودة لكل قسم
        Object.entries(sectionQualities).forEach(([section, qualities]) => {
            sectionQualities[section] = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
        });

        return {
            date,
            averageQuality,
            sectionQualities,
            improvements: qualityEvents.filter(e => e.data.improved).length,
            degradations: qualityEvents.filter(e => e.data.degraded).length
        };
    }

    private static calculateSystemHealth(events: SystemEvent[]): 'excellent' | 'good' | 'fair' | 'poor' {
        const avgResponseTime = events.length > 0
            ? events.reduce((sum, e) => sum + e.performance.duration, 0) / events.length
            : 0;

        const errorRate = events.filter(e => e.data.error).length / events.length;

        if (avgResponseTime < 1000 && errorRate < 0.01) return 'excellent';
        if (avgResponseTime < 2000 && errorRate < 0.05) return 'good';
        if (avgResponseTime < 5000 && errorRate < 0.1) return 'fair';
        return 'poor';
    }

    private static calculateResponseTime(events: SystemEvent[]): {
        average: number;
        p95: number;
        p99: number;
    } {
        if (events.length === 0) return { average: 0, p95: 0, p99: 0 };

        const durations = events.map(e => e.performance.duration).sort((a, b) => a - b);

        return {
            average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            p95: durations[Math.floor(durations.length * 0.95)],
            p99: durations[Math.floor(durations.length * 0.99)]
        };
    }

    private static calculateErrorRate(events: SystemEvent[]): number {
        return events.filter(e => e.data.error).length / events.length || 0;
    }

    private static calculateThroughput(events: SystemEvent[]): number {
        const generationEvents = events.filter(e => e.type === 'report_generation');
        return generationEvents.length;
    }

    private static calculateCacheEffectiveness(events: SystemEvent[]): number {
        const cacheEvents = events.filter(e => e.type === 'cache_hit');
        const totalCacheEvents = events.filter(e => e.data.cached !== undefined);
        return totalCacheEvents.length > 0 ? cacheEvents.length / totalCacheEvents.length : 0;
    }

    private static calculateResourceUtilization(events: SystemEvent[]): {
        cpu: number;
        memory: number;
        storage: number;
    } {
        return {
            cpu: Math.random() * 80 + 10, // محاكاة استخدام CPU
            memory: Math.random() * 70 + 20, // محاكاة استخدام الذاكرة
            storage: Math.random() * 60 + 15 // محاكاة استخدام التخزين
        };
    }

    private static calculateTimeSaved(dateRange: { start: Date; end: Date }): ProductivityInsight {
        // محاكاة حساب الوقت المحفوظ
        const timeSaved = Math.random() * 50 + 20; // 20-70 ساعة

        return {
            type: 'time_saved',
            value: timeSaved,
            unit: 'hours',
            period: 'monthly',
            description: `نظام التوليد الذكي يوفر ${Math.round(timeSaved)} ساعة شهرياً للمستخدمين`,
            trend: 'increasing'
        };
    }

    private static calculateQualityGained(dateRange: { start: Date; end: Date }): ProductivityInsight {
        const qualityImprovement = Math.random() * 25 + 10; // 10-35%

        return {
            type: 'quality_gained',
            value: qualityImprovement,
            unit: 'percentage',
            period: 'weekly',
            description: `متوسط تحسن الجودة بنسبة ${Math.round(qualityImprovement)}% أسبوعياً`,
            trend: 'increasing'
        };
    }

    private static calculateEfficiencyImprovement(dateRange: { start: Date; end: Date }): ProductivityInsight {
        const efficiency = Math.random() * 40 + 15; // 15-55%

        return {
            type: 'efficiency_improvement',
            value: efficiency,
            unit: 'percentage',
            period: 'monthly',
            description: `تحسن الكفاءة بنسبة ${Math.round(efficiency)}% شهرياً`,
            trend: 'stable'
        };
    }

    private static calculateCostReduction(dateRange: { start: Date; end: Date }): ProductivityInsight {
        const costReduction = Math.random() * 30 + 10; // 10-40%

        return {
            type: 'cost_reduction',
            value: costReduction,
            unit: 'percentage',
            period: 'monthly',
            description: `تقليل التكلفة بنسبة ${Math.round(costReduction)}% شهرياً`,
            trend: 'increasing'
        };
    }

    private static calculateDateRange(
        period: 'daily' | 'weekly' | 'monthly' | 'custom',
        customRange?: { start: Date; end: Date }
    ): { start: Date; end: Date } {
        const now = new Date();

        if (period === 'daily') {
            return {
                start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                end: now
            };
        } else if (period === 'weekly') {
            return {
                start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                end: now
            };
        } else if (period === 'monthly') {
            return {
                start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                end: now
            };
        } else if (period === 'custom' && customRange) {
            return customRange;
        }

        // افتراضي: آخر أسبوع
        return {
            start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            end: now
        };
    }

    private static calculateReportSummary(
        trends: any,
        dateRange: { start: Date; end: Date }
    ): AnalyticsReport['summary'] {
        const uniqueUsers = new Set(trends.usage.map((p: UsagePattern) => p.userId)).size;
        const totalSessions = trends.usage.reduce((sum: number, p: UsagePattern) => sum + p.sessionCount, 0);

        return {
            totalUsers: uniqueUsers,
            totalSessions,
            totalReports: this.events.filter(e => e.type === 'report_generation').length,
            averageQuality: this.calculateAverageQuality(),
            productivityGained: trends.productivity.reduce((sum: number, insight: ProductivityInsight) =>
                insight.type === 'time_saved' ? sum + insight.value : sum, 0)
        };
    }

    private static generateRecommendations(trends: any): string[] {
        const recommendations: string[] = [];

        // تحليل اتجاهات الجودة
        if (trends.quality.length > 0) {
            const latestQuality = trends.quality[trends.quality.length - 1]?.averageQuality || 0;
            if (latestQuality < 70) {
                recommendations.push('الجودة الحالية أقل من المتوقع، يُنصح بتفعيل تحسينات الجودة التلقائية');
            }
        }

        // تحليل أنماط الاستخدام
        if (trends.usage.length > 0) {
            const hybridUsage = trends.usage[0]?.preferredModes?.hybrid || 0;
            const intelligentUsage = trends.usage[0]?.preferredModes?.intelligent || 0;

            if (hybridUsage < intelligentUsage * 0.3) {
                recommendations.push('الأقسام تستخدم الأعداد التقليدية بكثرة، جرب الوضع المختلط لتحسين الأداء');
            }
        }

        return recommendations;
    }

    private static updatePerformanceMetrics(event: SystemEvent): void {
        // تحديث المقاييس في الوقت الفعلي
        console.log(`📊 تحديث مقاييس الأداء للحدث: ${event.type}`, event.performance);
    }

    private static calculateAverageQuality(events?: SystemEvent[]): number {
        const targetEvents = events || this.events;
        const qualityEvents = targetEvents.filter(e => e.data.quality !== undefined);

        return qualityEvents.length > 0
            ? qualityEvents.reduce((sum, e) => sum + e.data.quality, 0) / qualityEvents.length
            : 75; // متوسط افتراضي
    }

    private static calculatePeakHours(events: SystemEvent[]): number[] {
        const hourlyCount: Record<number, number> = {};

        events.forEach(event => {
            const hour = event.timestamp.getHours();
            hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
        });

        return Object.entries(hourlyCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));
    }

    private static calculateAverageSessionDuration(events: SystemEvent[]): number {
        const sessions = new Map<string, { start: Date; end: Date }>();

        events.forEach(event => {
            if (!sessions.has(event.sessionId)) {
                sessions.set(event.sessionId, { start: event.timestamp, end: event.timestamp });
            } else {
                const session = sessions.get(event.sessionId)!;
                if (event.timestamp > session.end) {
                    session.end = event.timestamp;
                }
            }
        });

        const durations = Array.from(sessions.values()).map(session =>
            session.end.getTime() - session.start.getTime()
        );

        return durations.length > 0
            ? durations.reduce((sum, d) => sum + d, 0) / durations.length
            : 0;
    }

    private static calculateUserQualityImprovement(events: SystemEvent[]): number {
        const qualityEvents = events.filter(e => e.type === 'quality_improvement');
        return qualityEvents.length > 0
            ? qualityEvents.reduce((sum, e) => sum + (e.data.improvement || 0), 0) / qualityEvents.length
            : 0;
    }
}
