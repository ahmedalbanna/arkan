/**
 * لوحة تحليل إحصائيات المستخدمين والأداء النظام
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserAnalyticsService } from '@/services/user-analytics-service';
import {
    Activity,
    BarChart3,
    Brain,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Info,
    TrendingDown,
    TrendingUp,
    Users
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface UserAnalyticsDashboardProps {
    userId?: string;
    sessionId?: string;
    className?: string;
}

interface DashboardMetrics {
    overview: {
        totalUsers: number;
        activeSessions: number;
        reportsGenerated: number;
        averageQuality: number;
        timeSaved: number;
    };
    realTime: {
        currentUsers: number;
        activeGenerations: number;
        lastHourActivity: number;
        systemLoad: number;
    };
    trends: {
        qualityOverTime: Array<{ date: string; quality: number }>;
        usagePatterns: Array<{ hour: number; count: number }>;
        sectionPopularity: Array<{ section: string; frequency: number }>;
    };
    insights: Array<{
        title: string;
        value: string;
        trend: 'up' | 'down' | 'stable';
        description: string;
        icon: React.ComponentType<any>;
    }>;
}

export function UserAnalyticsDashboard({
    userId,
    sessionId = `session_${Date.now()}`,
    className
}: UserAnalyticsDashboardProps) {

    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);

    // تحديث التقيمات تلقائياً
    useEffect(() => {
        loadAnalytics();

        const interval = setInterval(() => {
            updateRealTimeMetrics();
        }, 30000); // تحديث كل 30 ثانية

        return () => clearInterval(interval);
    }, [selectedPeriod]);

    // تحديث كل دقيقة للإحصائيات الساعية
    useEffect(() => {
        const hourlyInterval = setInterval(() => {
            loadAnalytics();
        }, 60000);

        return () => clearInterval(hourlyInterval);
    }, []);

    const loadAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            // تسجيل حدث جديد
            UserAnalyticsService.trackEvent(
                'user_action',
                { action: 'analytics_view', period: selectedPeriod },
                { duration: 100 },
                userId,
                sessionId
            );

            // تحميل التقيمات الشاملة
            const report = UserAnalyticsService.generateAnalyticsReport(selectedPeriod);

            // تحضير البيانات للعرض
            const dashboardMetrics: DashboardMetrics = {
                overview: {
                    totalUsers: report.summary.totalUsers,
                    activeSessions: report.summary.totalSessions,
                    reportsGenerated: report.summary.totalReports,
                    averageQuality: report.summary.averageQuality,
                    timeSaved: report.summary.productivityGained
                },
                realTime: {
                    currentUsers: 0,
                    activeGenerations: 0,
                    lastHourActivity: 0,
                    systemLoad: 0
                },
                trends: {
                    qualityOverTime: report.trends.quality.map(q => ({
                        date: new Date(q.date).toLocaleDateString(),
                        quality: q.averageQuality
                    })),
                    usagePatterns: [], // سيتم حسابه منفصل
                    sectionPopularity: report.trends.usage.length > 0
                        ? report.trends.usage[0].mostUsedSections.slice(0, 5)
                        : []
                },
                insights: await generateInsights(report)
            };

            setMetrics(dashboardMetrics);

        } catch (error) {
            console.error('خطأ في تحميل التحليلات:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriod, userId, sessionId]);

    const updateRealTimeMetrics = useCallback(async () => {
        try {
            const realtime = UserAnalyticsService.getRealTimeMetrics();

            // تسجيل حدث تتبع الوقت النشط
            UserAnalyticsService.trackEvent(
                'user_action',
                { action: 'real_time_update' },
                { duration: 10 },
                userId,
                sessionId
            );

            setRealtimeMetrics(realtime);

            // تحديث المقاييس في الوقت الفعلي
            if (metrics) {
                setMetrics(prev => ({
                    ...prev!,
                    realTime: {
                        currentUsers: realtime.currentUsers,
                        activeGenerations: realtime.activeGenerations,
                        lastHourActivity: realtime.currentUsers,
                        systemLoad: realtime.currentPerformance.resourceUtilization.cpu
                    }
                }));
            }

        } catch (error) {
            console.error('خطأ في تحديث المقاييس في الوقت الفعلي:', error);
        }
    }, [userId, sessionId, metrics]);

    const generateInsights = async (report: any): Promise<DashboardMetrics['insights']> => {
        const insights: DashboardMetrics['insights'] = [];

        // تحليل اتجاهات الجودة
        if (report.trends.quality.length > 1) {
            const latest = report.trends.quality[report.trends.quality.length - 1]?.averageQuality || 0;
            const previous = report.trends.quality[report.trends.quality.length - 2]?.averageQuality || 0;
            const change = latest - previous;

            insights.push({
                title: 'تقدم جودة المحتوى',
                value: `${latest.toFixed(1)}%`,
                trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
                description: change > 0 ? `تحسن بما يُقدر بـ +${change.toFixed(1)}%` :
                    change < 0 ? `تراجع بما يُقدر بـ ${change.toFixed(1)}%` : 'مستقر',
                icon: TrendingUp
            });
        }

        // تحليل الإنتاجية
        if (report.trends.productivity.length > 0) {
            const timeInsight = report.trends.productivity.find((p: any) => p.type === 'time_saved');
            if (timeInsight) {
                insights.push({
                    title: 'الوقت المُوفر',
                    value: `${Math.round(timeInsight.value)} ساعة`,
                    trend: 'up',
                    description: timeInsight.description,
                    icon: Clock
                });
            }
        }

        // تحليل الكفاءة
        const avgQuality = report.summary.averageQuality;
        if (avgQuality > 85) {
            insights.push({
                title: 'جودة عالية متسقة',
                value: `${avgQuality.toFixed(1)}%`,
                trend: 'up',
                description: 'النظام يحقق مستويات جودة ممتازة بشكل متسق',
                icon: CheckCircle
            });
        }

        // تحليل عدد المستخدمين
        if (report.summary.totalUsers > 0) {
            insights.push({
                title: 'معدل استخدام النظام',
                value: `${report.summary.totalUsers} مستخدم`,
                trend: report.summary.totalUsers > 10 ? 'up' : 'stable',
                description: `${report.summary.totalSessions} جلسة نشطة هذا الأسبوع`,
                icon: Users
            });
        }

        return insights.slice(0, 4); // عرض أفضل 4 رؤى فقط
    };

    const exportData = useCallback(() => {
        UserAnalyticsService.trackEvent(
            'user_action',
            { action: 'export_analytics', period: selectedPeriod },
            { duration: 200 },
            userId,
            sessionId
        );
        console.log('📊 تصدير بيانات التحليلات...');
        // منطق التصدير هنا
    }, [selectedPeriod, userId, sessionId]);

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getSystemHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900';
            case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
            case 'fair': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
            case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);

        if (diffHours > 0) return `${diffHours} ساعة مضت`;
        return `${diffMinutes} دقيقة مضت`;
    };

    if (isLoading && !metrics) {
        return (
            <Card className={className}>
                <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3">جاري تحميل البيانات...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* العنوان ومركم التحكم */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                لوحة التحليلات والمراقبة
                            </CardTitle>
                            <CardDescription>
                                نظرة شاملة عن أداء النظام واستخدام المستخدمين
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                                className="px-3 py-1 border rounded"
                            >
                                <option value="daily">يومي</option>
                                <option value="weekly">أسبوعي</option>
                                <option value="monthly">شهري</option>
                            </select>
                            <Button onClick={exportData} variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                تصدير
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* نظرة عامة سريعة */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">إجمالي المستخدمين</div>
                                    <div className="text-2xl font-semibold">{metrics.overview.totalUsers}</div>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">الجلسات النشطة</div>
                                    <div className="text-2xl font-semibold">{metrics.overview.activeSessions}</div>
                                </div>
                                <Activity className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">التقارير المُولدة</div>
                                    <div className="text-2xl font-semibold">{metrics.overview.reportsGenerated}</div>
                                </div>
                                <Brain className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">متوسط الجودة</div>
                                    <div className="text-2xl font-semibold">{metrics.overview.averageQuality.toFixed(1)}%</div>
                                </div>
                                <CheckCircle className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">الوقت المُوفر</div>
                                    <div className="text-2xl font-semibold">{Math.round(metrics.overview.timeSaved)}h</div>
                                </div>
                                <Clock className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* إحصائيات الوقت النشط */}
            {realtimeMetrics && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <Eye className="h-5 w-5" />
                            المراقبة في الوقت الفعلي
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-blue-600">
                                    {realtimeMetrics.currentUsers}
                                </div>
                                <div className="text-xs text-muted-foreground">مستخدم نشط</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-green-600">
                                    {realtimeMetrics.activeGenerations}
                                </div>
                                <div className="text-xs text-muted-foreground">تصنيف جاري</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-yellow-600">
                                    {realtimeMetrics.averageQuality.toFixed(1)}%
                                </div>
                                <div className="text-xs text-muted-foreground">جودة متوسطة</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-purple-600">
                                    {realtimeMetrics.currentPerformance.resourceUtilization.cpu.toFixed(0)}%
                                </div>
                                <div className="text-xs text-muted-foreground">استخدام النظام</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* الرؤى الذكيَّة */}
            {metrics?.insights && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            الرؤى الذكيَّة
                        </CardTitle>
                        <CardDescription>
                            تحليل ذكي لاتجاهات الاستخدام والأداء
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {metrics.insights.map((insight, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                                    <div className="mt-1">
                                        {getTrendIcon(insight.trend)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium text-sm">{insight.title}</div>
                                            <Badge variant="outline" className="text-sm">
                                                {insight.value}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {insight.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* اتجاهات الجودة */}
            {metrics?.trends && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                اتجاهات الجودة
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {metrics.trends.qualityOverTime.slice(-5).map((trend, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm">{trend.date}</span>
                                        <div className="flex items-center gap-2">
                                            <Progress value={trend.quality} className="w-24 h-2" />
                                            <span className="text-sm font-medium">{trend.quality.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                شعبية الأقسام
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {metrics.trends.sectionPopularity.map((section, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm">{section.section}</span>
                                        <Badge variant="outline">{section.frequency}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* معلومات إضافية */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    هذه الإحصائيات تُحدث تلقائياً كل دقيقة. يمكنك تصدير البيانات للحصول على تحليل أعمق.
                </AlertDescription>
            </Alert>
        </div>
    );
}
