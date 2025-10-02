/**
 * مكون تتبع التقدم المتقدم للتوليد الذكي
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ReportProgress } from '@/hooks/use-intelligent-report';
import { SUPPORTED_SECTIONS } from '@/services/intelligent-report-service';
import {
    AlertCircle,
    Brain,
    CheckCircle,
    Clock,
    Loader2,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';

interface ProgressTrackerProps {
    progress: ReportProgress;
    mode: 'single' | 'complete';
    sectionsToGenerate?: SectionName[];
    className?: string;
}

export function ProgressTracker({
    progress,
    mode,
    sectionsToGenerate = [],
    className
}: ProgressTrackerProps) {

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'preparing':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'generating':
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Brain className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'preparing': return 'blue';
            case 'generating': return 'blue';
            case 'completed': return 'green';
            case 'error': return 'red';
            default: return 'gray';
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* شريط التقدم الرئيسي */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getStageIcon(progress.stage)}
                            <span>تقدم التوليد</span>
                        </div>
                        <Badge variant={progress.stage === 'error' ? 'destructive' : 'default'}>
                            {progress.percentage}%
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* شريط التقدم */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>{progress.message}</span>
                            <span className="text-muted-foreground">{progress.percentage}%</span>
                        </div>
                        <Progress
                            value={progress.percentage}
                            className={`h-3 ${getProgressColor(progress.percentage)}`}
                        />
                    </div>

                    {/* معلومات إضافية */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">نظام ذكي</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-muted-foreground">تحسين تكراري</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">جودة عالية</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <span className="text-muted-foreground">مراقبة أداء</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* تفاصيل الأقسام للتقرير الكامل */}
            {mode === 'complete' && progress.sectionProgress && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">تقدم الأقسام</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sectionsToGenerate.map((section, index) => {
                                const sectionProgress = progress.sectionProgress?.[section];
                                const sectionInfo = SUPPORTED_SECTIONS[section];

                                if (!sectionInfo) return null;

                                const getStatusBadge = (status?: string) => {
                                    switch (status) {
                                        case 'completed':
                                            return <Badge variant="default" className="text-xs">مكتمل</Badge>;
                                        case 'generating':
                                            return <Badge variant="secondary" className="text-xs">جاري التوليد</Badge>;
                                        case 'error':
                                            return <Badge variant="destructive" className="text-xs">خطأ</Badge>;
                                        default:
                                            return <Badge variant="outline" className="text-xs">في الانتظار</Badge>;
                                    }
                                };

                                const getStatusIcon = (status?: string) => {
                                    switch (status) {
                                        case 'completed':
                                            return <CheckCircle className="h-4 w-4 text-green-500" />;
                                        case 'generating':
                                            return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
                                        case 'error':
                                            return <AlertCircle className="h-4 w-4 text-red-500" />;
                                        default:
                                            return <Clock className="h-4 w-4 text-gray-400" />;
                                    }
                                };

                                return (
                                    <div
                                        key={section}
                                        className={`p-3 border rounded-lg transition-all ${sectionProgress?.status === 'completed' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
                                                sectionProgress?.status === 'generating' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950' :
                                                    sectionProgress?.status === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950' :
                                                        'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(sectionProgress?.status)}
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {index + 1}. {sectionInfo.title}
                                                    </div>
                                                    {sectionProgress?.status === 'generating' && (
                                                        <div className="text-xs text-muted-foreground">
                                                            جاري التوليد بالنظام الذكي...
                                                        </div>
                                                    )}
                                                    {sectionProgress?.status === 'completed' && sectionProgress.qualityScore && (
                                                        <div className="text-xs text-green-600">
                                                            جودة: {sectionProgress.qualityScore}/100 -
                                                            وقت: {sectionProgress.generationTime}ms
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(sectionProgress?.status)}
                                                {progress.currentSection === section && (
                                                    <Badge variant="secondary" className="text-xs animate-pulse">
                                                        نشط
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ملخص التقدم */}
                        <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-medium text-green-600">
                                        {progress.completedSections?.length || 0}
                                    </div>
                                    <div className="text-muted-foreground">مكتمل</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-medium text-blue-600">
                                        {Object.values(progress.sectionProgress || {}).filter(s => s.status === 'generating').length}
                                    </div>
                                    <div className="text-muted-foreground">جاري التوليد</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-medium text-gray-600">
                                        {Object.values(progress.sectionProgress || {}).filter(s => s.status === 'pending').length}
                                    </div>
                                    <div className="text-muted-foreground">في الانتظار</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-medium text-red-600">
                                        {Object.values(progress.sectionProgress || {}).filter(s => s.status === 'error').length}
                                    </div>
                                    <div className="text-muted-foreground">أخطاء</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* رسائل الحالة المتقدمة */}
            {progress.stage === 'generating' && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            <div>
                                <div className="font-medium text-blue-900 dark:text-blue-100">
                                    النظام الذكي يعمل
                                </div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    {mode === 'single'
                                        ? 'جاري تحليل السياق وتوليد المحتوى بجودة عالية'
                                        : 'جاري توليد الأقسام بالترتيب الذكي مع مراعاة التبعيات'
                                    }
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {progress.stage === 'completed' && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <div className="font-medium text-green-900 dark:text-green-100">
                                    تم التوليد بنجاح!
                                </div>
                                <div className="text-sm text-green-700 dark:text-green-300">
                                    {mode === 'single'
                                        ? 'تم توليد القسم بجودة عالية باستخدام النظام الذكي'
                                        : `تم توليد ${progress.completedSections?.length || 0} قسم بنجاح`
                                    }
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {progress.stage === 'error' && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <div className="font-medium text-red-900 dark:text-red-100">
                                    حدث خطأ في التوليد
                                </div>
                                <div className="text-sm text-red-700 dark:text-red-300">
                                    {progress.message}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
