/**
 * نظام مراقبة الأداء للذكاء الاصطناعي المحسن
 * يراقب ويقيس أداء جميع مكونات النظام الذكي
 */

export interface PerformanceMetrics {
    // مقاييس الوقت
    executionTime: number; // بالميلي ثانية
    contextAnalysisTime: number;
    modelSelectionTime: number;
    promptBuildingTime: number;
    generationTime: number;
    qualityValidationTime: number;
    iterativeImprovementTime?: number;

    // مقاييس الجودة
    qualityScore: number;
    improvementIterations: number;
    finalAccuracy: number;

    // مقاييس الاستخدام
    tokensUsed: number;
    modelSwitches: number;
    memoryUsage: number; // بالميجابايت

    // مقاييس النجاح
    successRate: number;
    errorCount: number;
    fallbackUsed: boolean;
}

export interface PerformanceSession {
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    taskType: string;
    domain: string;
    userInput: string;
    metrics: PerformanceMetrics;
    contextAnalysis?: any;
    modelConfig?: any;
    status: 'running' | 'completed' | 'failed';
    errors: string[];
}

export interface PerformanceReport {
    totalSessions: number;
    averageExecutionTime: number;
    averageQualityScore: number;
    successRate: number;
    mostCommonErrors: Array<{ error: string; count: number }>;
    performanceTrends: Array<{ date: string; avgTime: number; avgQuality: number }>;
    modelUsageStats: Array<{ model: string; usage: number; avgQuality: number }>;
    recommendations: string[];
}

export class PerformanceMonitor {
    private static sessions: Map<string, PerformanceSession> = new Map();
    private static completedSessions: PerformanceSession[] = [];

    /**
     * بدء جلسة مراقبة جديدة
     */
    static startSession(config: {
        taskType: string;
        domain: string;
        userInput: string;
    }): string {
        const sessionId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: PerformanceSession = {
            sessionId,
            startTime: new Date(),
            taskType: config.taskType,
            domain: config.domain,
            userInput: config.userInput,
            metrics: {
                executionTime: 0,
                contextAnalysisTime: 0,
                modelSelectionTime: 0,
                promptBuildingTime: 0,
                generationTime: 0,
                qualityValidationTime: 0,
                qualityScore: 0,
                improvementIterations: 0,
                finalAccuracy: 0,
                tokensUsed: 0,
                modelSwitches: 0,
                memoryUsage: 0,
                successRate: 0,
                errorCount: 0,
                fallbackUsed: false
            },
            status: 'running',
            errors: []
        };

        this.sessions.set(sessionId, session);
        console.log(`📊 بدء مراقبة الأداء: ${sessionId}`);

        return sessionId;
    }

    /**
     * تسجيل وقت مرحلة معينة
     */
    static recordPhaseTime(
        sessionId: string,
        phase: keyof Pick<PerformanceMetrics,
            'contextAnalysisTime' | 'modelSelectionTime' | 'promptBuildingTime' |
            'generationTime' | 'qualityValidationTime' | 'iterativeImprovementTime'>,
        duration: number
    ): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.metrics[phase] = duration;
            console.log(`⏱️ ${phase}: ${duration}ms`);
        }
    }

    /**
     * تسجيل مقاييس الجودة
     */
    static recordQualityMetrics(
        sessionId: string,
        metrics: {
            qualityScore: number;
            improvementIterations?: number;
            finalAccuracy?: number;
        }
    ): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.metrics.qualityScore = metrics.qualityScore;
            if (metrics.improvementIterations !== undefined) {
                session.metrics.improvementIterations = metrics.improvementIterations;
            }
            if (metrics.finalAccuracy !== undefined) {
                session.metrics.finalAccuracy = metrics.finalAccuracy;
            }
            console.log(`📈 جودة المخرجات: ${metrics.qualityScore}/100`);
        }
    }

    /**
     * تسجيل استخدام الموارد
     */
    static recordResourceUsage(
        sessionId: string,
        usage: {
            tokensUsed?: number;
            modelSwitches?: number;
            memoryUsage?: number;
        }
    ): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            if (usage.tokensUsed !== undefined) {
                session.metrics.tokensUsed += usage.tokensUsed;
            }
            if (usage.modelSwitches !== undefined) {
                session.metrics.modelSwitches += usage.modelSwitches;
            }
            if (usage.memoryUsage !== undefined) {
                session.metrics.memoryUsage = Math.max(session.metrics.memoryUsage, usage.memoryUsage);
            }
        }
    }

    /**
     * تسجيل خطأ
     */
    static recordError(sessionId: string, error: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.errors.push(error);
            session.metrics.errorCount++;
            console.warn(`❌ خطأ في الجلسة ${sessionId}: ${error}`);
        }
    }

    /**
     * تسجيل استخدام الخطة الاحتياطية
     */
    static recordFallbackUsage(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.metrics.fallbackUsed = true;
            console.log(`🔄 تم استخدام الخطة الاحتياطية في الجلسة ${sessionId}`);
        }
    }

    /**
     * إنهاء جلسة المراقبة
     */
    static endSession(sessionId: string, success: boolean = true): PerformanceSession | null {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        session.endTime = new Date();
        session.status = success ? 'completed' : 'failed';
        session.metrics.executionTime = session.endTime.getTime() - session.startTime.getTime();
        session.metrics.successRate = success ? 100 : 0;

        // نقل الجلسة إلى المكتملة
        this.completedSessions.push(session);
        this.sessions.delete(sessionId);

        console.log(`✅ انتهت مراقبة الأداء: ${sessionId} (${session.metrics.executionTime}ms)`);

        return session;
    }

    /**
     * الحصول على تقرير الأداء الشامل
     */
    static generatePerformanceReport(timeRange?: { start: Date; end: Date }): PerformanceReport {
        let sessions = this.completedSessions;

        // تطبيق فلتر الوقت إذا تم تحديده
        if (timeRange) {
            sessions = sessions.filter(session =>
                session.startTime >= timeRange.start &&
                session.startTime <= timeRange.end
            );
        }

        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                averageExecutionTime: 0,
                averageQualityScore: 0,
                successRate: 0,
                mostCommonErrors: [],
                performanceTrends: [],
                modelUsageStats: [],
                recommendations: ['لا توجد بيانات كافية لتوليد التقرير']
            };
        }

        // حساب المتوسطات
        const totalExecutionTime = sessions.reduce((sum, s) => sum + s.metrics.executionTime, 0);
        const totalQualityScore = sessions.reduce((sum, s) => sum + s.metrics.qualityScore, 0);
        const successfulSessions = sessions.filter(s => s.status === 'completed').length;

        // تحليل الأخطاء الشائعة
        const errorCounts: { [key: string]: number } = {};
        sessions.forEach(session => {
            session.errors.forEach(error => {
                errorCounts[error] = (errorCounts[error] || 0) + 1;
            });
        });

        const mostCommonErrors = Object.entries(errorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([error, count]) => ({ error, count }));

        // تحليل اتجاهات الأداء (آخر 7 أيام)
        const performanceTrends = this.calculatePerformanceTrends(sessions);

        // إحصائيات استخدام النماذج
        const modelUsageStats = this.calculateModelUsageStats(sessions);

        // توليد التوصيات
        const recommendations = this.generateRecommendations(sessions);

        return {
            totalSessions: sessions.length,
            averageExecutionTime: totalExecutionTime / sessions.length,
            averageQualityScore: totalQualityScore / sessions.length,
            successRate: (successfulSessions / sessions.length) * 100,
            mostCommonErrors,
            performanceTrends,
            modelUsageStats,
            recommendations
        };
    }

    /**
     * حساب اتجاهات الأداء
     */
    private static calculatePerformanceTrends(sessions: PerformanceSession[]): Array<{ date: string; avgTime: number; avgQuality: number }> {
        const dailyStats: { [date: string]: { times: number[]; qualities: number[] } } = {};

        sessions.forEach(session => {
            const date = session.startTime.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { times: [], qualities: [] };
            }
            dailyStats[date].times.push(session.metrics.executionTime);
            dailyStats[date].qualities.push(session.metrics.qualityScore);
        });

        return Object.entries(dailyStats)
            .map(([date, stats]) => ({
                date,
                avgTime: stats.times.reduce((sum, time) => sum + time, 0) / stats.times.length,
                avgQuality: stats.qualities.reduce((sum, quality) => sum + quality, 0) / stats.qualities.length
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7); // آخر 7 أيام
    }

    /**
     * حساب إحصائيات استخدام النماذج
     */
    private static calculateModelUsageStats(sessions: PerformanceSession[]): Array<{ model: string; usage: number; avgQuality: number }> {
        const modelStats: { [model: string]: { count: number; totalQuality: number } } = {};

        sessions.forEach(session => {
            const model = session.modelConfig?.modelId || 'unknown';
            if (!modelStats[model]) {
                modelStats[model] = { count: 0, totalQuality: 0 };
            }
            modelStats[model].count++;
            modelStats[model].totalQuality += session.metrics.qualityScore;
        });

        return Object.entries(modelStats)
            .map(([model, stats]) => ({
                model,
                usage: stats.count,
                avgQuality: stats.totalQuality / stats.count
            }))
            .sort((a, b) => b.usage - a.usage);
    }

    /**
     * توليد التوصيات بناءً على البيانات
     */
    private static generateRecommendations(sessions: PerformanceSession[]): string[] {
        const recommendations: string[] = [];

        if (sessions.length === 0) return recommendations;

        const avgExecutionTime = sessions.reduce((sum, s) => sum + s.metrics.executionTime, 0) / sessions.length;
        const avgQualityScore = sessions.reduce((sum, s) => sum + s.metrics.qualityScore, 0) / sessions.length;
        const successRate = sessions.filter(s => s.status === 'completed').length / sessions.length;
        const fallbackUsage = sessions.filter(s => s.metrics.fallbackUsed).length / sessions.length;

        // توصيات الأداء
        if (avgExecutionTime > 10000) { // أكثر من 10 ثواني
            recommendations.push('⚡ الأداء بطيء - فكر في تحسين النماذج أو تقليل التكرارات');
        }

        // توصيات الجودة
        if (avgQualityScore < 70) {
            recommendations.push('📈 جودة المخرجات منخفضة - راجع prompts والنماذج المستخدمة');
        } else if (avgQualityScore > 90) {
            recommendations.push('🎯 جودة ممتازة - يمكن تقليل التكرارات لتحسين السرعة');
        }

        // توصيات الموثوقية
        if (successRate < 0.9) {
            recommendations.push('🔧 معدل النجاح منخفض - راجع معالجة الأخطاء والخطط الاحتياطية');
        }

        // توصيات استخدام الخطة الاحتياطية
        if (fallbackUsage > 0.2) {
            recommendations.push('🔄 استخدام عالي للخطة الاحتياطية - راجع النماذج الأساسية');
        }

        // توصيات عامة
        if (recommendations.length === 0) {
            recommendations.push('✅ الأداء جيد - استمر في المراقبة والتحسين التدريجي');
        }

        return recommendations;
    }

    /**
     * تصدير البيانات للتحليل الخارجي
     */
    static exportData(format: 'json' | 'csv' = 'json'): string {
        if (format === 'json') {
            return JSON.stringify(this.completedSessions, null, 2);
        } else {
            // تصدير CSV بسيط
            const headers = [
                'sessionId', 'startTime', 'taskType', 'domain', 'executionTime',
                'qualityScore', 'improvementIterations', 'tokensUsed', 'status'
            ];

            const rows = this.completedSessions.map(session => [
                session.sessionId,
                session.startTime.toISOString(),
                session.taskType,
                session.domain,
                session.metrics.executionTime,
                session.metrics.qualityScore,
                session.metrics.improvementIterations,
                session.metrics.tokensUsed,
                session.status
            ]);

            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
    }

    /**
     * مسح البيانات القديمة
     */
    static clearOldData(olderThanDays: number = 30): number {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const initialCount = this.completedSessions.length;
        this.completedSessions = this.completedSessions.filter(
            session => session.startTime >= cutoffDate
        );

        const removedCount = initialCount - this.completedSessions.length;
        console.log(`🗑️ تم حذف ${removedCount} جلسة قديمة`);

        return removedCount;
    }

    /**
     * الحصول على إحصائيات سريعة
     */
    static getQuickStats(): {
        activeSessions: number;
        completedSessions: number;
        avgQualityToday: number;
        avgExecutionTimeToday: number;
    } {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = this.completedSessions.filter(
            session => session.startTime.toISOString().split('T')[0] === today
        );

        return {
            activeSessions: this.sessions.size,
            completedSessions: this.completedSessions.length,
            avgQualityToday: todaySessions.length > 0
                ? todaySessions.reduce((sum, s) => sum + s.metrics.qualityScore, 0) / todaySessions.length
                : 0,
            avgExecutionTimeToday: todaySessions.length > 0
                ? todaySessions.reduce((sum, s) => sum + s.metrics.executionTime, 0) / todaySessions.length
                : 0
        };
    }
}
