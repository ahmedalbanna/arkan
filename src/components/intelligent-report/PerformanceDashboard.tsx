/**
 * لوحة مراقبة الأداء للنظام الذكي
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { PerformanceStats } from '@/services/intelligent-report-service';
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    RefreshCw,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';

interface PerformanceDashboardProps {
    stats?: PerformanceStats;
    realTimeMetrics: {
        activeGenerations: number;
        totalGenerationsToday: number;
        averageQualityToday: number;
        averageTimeToday: number;
        systemLoad: 'منخفض' | 'متوسط' | 'عالي';
    };
    isLoading?: boolean;
    onRefresh?: () => void;
    className?: string;
}

export function PerformanceDashboard({
    stats,
    realTimeMetrics,
    isLoading,
    onRefresh,
    className
}: PerformanceDashboardProps) {

    const getSystemLoadColor = (load: string) => {
        switch (load) {
            case 'منخفض': return 'text-green-600 bg-green-100 dark:bg-green-900';
            case 'متوسط': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
            case 'عالي': return 'text-red-600 bg-red-100 dark:bg-red-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    const getSystemLoadIcon = (load: string) => {
        switch (load) {
            case 'منخفض': return <CheckCircle className="h-4 w-4" />;
            case 'متوسط': return <AlertCircle className="h-4 w-4" />;
            case 'عالي': return <AlertCircle className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        const seconds = Math.round(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.round(seconds / 60);
        return `${minutes}m`;
    };

    const getQualityColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 85) return 'text-blue-600';
        if (score >= 80) return 'text-yellow-600';
        if (score >= 70) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* حالة النظام */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Activity className="h-5 w-5" />
                            حالة النظام
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                            تحديث
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* حمولة النظام */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getSystemLoadIcon(realTimeMetrics.systemLoad)}
                            <span className="text-sm font-medium">حمولة النظام</span>
                        </div>
                        <Badge className={getSystemLoadColor(realTimeMetrics.systemLoad)}>
                            {realTimeMetrics.systemLoad}
                        </Badge>
                    </div>

                    {/* العمليات النشطة */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">عمليات نشطة</span>
                        </div>
                        <Badge variant={realTimeMetrics.activeGenerations > 0 ? "default" : "outline"}>
                            {realTimeMetrics.activeGenerations}
                        </Badge>
                    </div>

                    {/* معدل النجاح */}
                    {stats?.data?.performanceReport && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>معدل النجاح</span>
                                <span className="text-green-600 font-medium">
                                    {stats.data.performanceReport.successRate.toFixed(1)}%
                                </span>
                            </div>
                            <Progress
                                value={stats.data.performanceReport.successRate}
                                className="h-2"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* إحصائيات اليوم */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5" />
                        إحصائيات اليوم
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-lg font-semibold text-blue-600">
                                {realTimeMetrics.totalGenerationsToday}
                            </div>
                            <div className="text-xs text-muted-foreground">عمليات مكتملة</div>
                        </div>

                        <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Target className="h-4 w-4 text-green-600" />
                            </div>
                            <div className={`text-lg font-semibold ${getQualityColor(realTimeMetrics.averageQualityToday)}`}>
                                {realTimeMetrics.averageQualityToday.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">متوسط الجودة</div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg col-span-2">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="text-lg font-semibold text-purple-600">
                                {formatTime(realTimeMetrics.averageTimeToday)}
                            </div>
                            <div className="text-xs text-muted-foreground">متوسط وقت التوليد</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* الإحصائيات العامة */}
            {stats?.data?.performanceReport && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5" />
                            الإحصائيات العامة
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="text-lg font-semibold text-gray-600">
                                    {stats.data.performanceReport.totalSessions}
                                </div>
                                <div className="text-xs text-muted-foreground">إجمالي الجلسات</div>
                            </div>

                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="text-lg font-semibold text-gray-600">
                                    {formatTime(stats.data.performanceReport.averageExecutionTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">متوسط وقت التنفيذ</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* التوصيات */}
            {stats?.data?.performanceReport?.recommendations && stats.data.performanceReport.recommendations.length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-blue-900 dark:text-blue-100">
                            <TrendingUp className="h-5 w-5" />
                            توصيات النظام
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            {stats.data.performanceReport.recommendations.slice(0, 3).map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{recommendation}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* ميزات النظام */}
            {stats?.data?.systemInfo && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle className="h-5 w-5" />
                            ميزات النظام المفعلة
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(stats.data.systemInfo.features).map(([feature, enabled]) => (
                                <div key={feature} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <span className={enabled ? 'text-foreground' : 'text-muted-foreground'}>
                                        {feature === 'intelligentContextAnalysis' ? 'تحليل السياق الذكي' :
                                            feature === 'adaptiveModelSelection' ? 'اختيار النموذج التكيفي' :
                                                feature === 'qualityValidation' ? 'تقييم الجودة' :
                                                    feature === 'iterativeImprovement' ? 'التحسين التكراري' :
                                                        feature === 'performanceMonitoring' ? 'مراقبة الأداء' :
                                                            feature === 'completeReportGeneration' ? 'توليد التقارير الكاملة' :
                                                                feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* حالة التحميل */}
            {isLoading && (
                <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center gap-3">
                            <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                            <span className="text-sm text-muted-foreground">جاري تحديث الإحصائيات...</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
