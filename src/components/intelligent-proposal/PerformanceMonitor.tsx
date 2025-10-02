/**
 * مكون مراقبة الأداء للنظام الذكي
 * يعرض إحصائيات الأداء والصحة العامة للنظام
 */

'use client';

import { PerformanceMonitor as PerformanceMonitorAI } from '@/ai/core/performance-monitor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Cpu,
    RefreshCw,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PerformanceData {
    averageExecutionTime: number;
    averageQualityScore: number;
    successRate: number;
    totalOperations: number;
    systemHealth: {
        overall: 'excellent' | 'good' | 'fair' | 'poor';
        recommendations: string[];
        lastUpdated: Date;
    };
}

export function PerformanceMonitor() {
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // تحديث البيانات
    const refreshData = () => {
        setIsLoading(true);
        try {
            const stats = PerformanceMonitorAI.generatePerformanceReport();
            setPerformanceData(stats as unknown as PerformanceData);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('خطأ في تحديث بيانات الأداء:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // تحديث تلقائي كل 30 ثانية
    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    // ألوان حالة النظام
    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
            case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'poor': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // أيقونة حالة النظام
    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'excellent': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'good': return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'fair': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'poor': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Activity className="h-5 w-5 text-gray-500" />;
        }
    };

    // تسمية حالة النظام
    const getHealthLabel = (health: string) => {
        switch (health) {
            case 'excellent': return 'ممتاز';
            case 'good': return 'جيد';
            case 'fair': return 'مقبول';
            case 'poor': return 'ضعيف';
            default: return 'غير معروف';
        }
    };

    if (isLoading && !performanceData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        مراقبة الأداء
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="mr-2">جاري تحميل بيانات الأداء...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!performanceData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        مراقبة الأداء
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            لا توجد بيانات أداء متاحة حالياً
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* رأس مراقبة الأداء */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            مراقبة الأداء
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshData}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* حالة النظام العامة */}
                    <div className={`p-4 rounded-lg border ${getHealthColor(performanceData.systemHealth.overall)}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {getHealthIcon(performanceData.systemHealth.overall)}
                            <div>
                                <div className="font-semibold">
                                    حالة النظام: {getHealthLabel(performanceData.systemHealth.overall)}
                                </div>
                                <div className="text-sm opacity-75">
                                    {performanceData.totalOperations} عملية إجمالية
                                </div>
                            </div>
                        </div>

                        {/* التوصيات */}
                        {performanceData.systemHealth.recommendations.length > 0 && (
                            <div className="mt-3">
                                <div className="text-sm font-medium mb-1">التوصيات:</div>
                                <ul className="text-sm space-y-1">
                                    {performanceData.systemHealth.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-xs mt-1">•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* مقاييس الأداء الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* متوسط وقت التنفيذ */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {(performanceData.averageExecutionTime / 1000).toFixed(1)}s
                                </div>
                                <div className="text-sm text-muted-foreground">متوسط وقت التنفيذ</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* متوسط جودة المخرجات */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {performanceData.averageQualityScore.toFixed(1)}
                                </div>
                                <div className="text-sm text-muted-foreground">متوسط الجودة</div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Progress
                                value={performanceData.averageQualityScore}
                                className="h-2"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* معدل النجاح */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {performanceData.successRate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">معدل النجاح</div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Progress
                                value={performanceData.successRate}
                                className="h-2"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* إجمالي العمليات */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <Cpu className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {performanceData.totalOperations.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">إجمالي العمليات</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* معلومات إضافية */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        تفاصيل الأداء
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium mb-2">توزيع الجودة</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>ممتاز (90-100)</span>
                                    <Badge variant="outline" className="text-green-600">
                                        {performanceData.averageQualityScore >= 90 ? '✓' : '-'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>جيد (80-89)</span>
                                    <Badge variant="outline" className="text-blue-600">
                                        {performanceData.averageQualityScore >= 80 && performanceData.averageQualityScore < 90 ? '✓' : '-'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>مقبول (70-79)</span>
                                    <Badge variant="outline" className="text-yellow-600">
                                        {performanceData.averageQualityScore >= 70 && performanceData.averageQualityScore < 80 ? '✓' : '-'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>ضعيف (أقل من 70)</span>
                                    <Badge variant="outline" className="text-red-600">
                                        {performanceData.averageQualityScore < 70 ? '✓' : '-'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium mb-2">مؤشرات الأداء</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>سرعة الاستجابة</span>
                                    <Badge variant="outline" className={
                                        performanceData.averageExecutionTime < 10000 ? 'text-green-600' :
                                            performanceData.averageExecutionTime < 20000 ? 'text-yellow-600' : 'text-red-600'
                                    }>
                                        {performanceData.averageExecutionTime < 10000 ? 'سريع' :
                                            performanceData.averageExecutionTime < 20000 ? 'متوسط' : 'بطيء'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>الاستقرار</span>
                                    <Badge variant="outline" className={
                                        performanceData.successRate >= 95 ? 'text-green-600' :
                                            performanceData.successRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                                    }>
                                        {performanceData.successRate >= 95 ? 'مستقر' :
                                            performanceData.successRate >= 85 ? 'جيد' : 'يحتاج تحسين'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>الجودة العامة</span>
                                    <Badge variant="outline" className={
                                        performanceData.averageQualityScore >= 85 ? 'text-green-600' :
                                            performanceData.averageQualityScore >= 75 ? 'text-yellow-600' : 'text-red-600'
                                    }>
                                        {performanceData.averageQualityScore >= 85 ? 'عالية' :
                                            performanceData.averageQualityScore >= 75 ? 'متوسطة' : 'منخفضة'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
