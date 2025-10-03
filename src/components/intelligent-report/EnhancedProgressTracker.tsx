/**
 * مكون تتبع التقدم المحسن مع تقديرات الوقت والمراقبة المخصصة
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ReportProgress } from '@/hooks/use-intelligent-report';
import { SUPPORTED_SECTIONS } from '@/services/intelligent-report-service';
import {
    AlertCircle,
    AlertTriangle,
    Brain,
    CheckCircle,
    Clock,
    Info,
    Loader2,
    Pause,
    Play,
    Target,
    Timer,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface TimeEstimate {
    estimatedTotal: number;
    elapsedTime: number;
    remainingTime: number;
    averageSectionTime: number;
}

interface EnhancedSectionProgress {
    section: SectionName;
    status: 'pending' | 'preparing' | 'generating' | 'validating' | 'completed' | 'error';
    progress: number;
    qualityScore?: number;
    generationTime?: number;
    estimatedTime?: number;
    remainingTime?: number;
    iterations?: number;
    currentPhase: string;
    modelUsed?: string;
    errorMessage?: string;
}

interface EnhancedProgressTrackerProps {
    progress: ReportProgress;
    mode: 'single' | 'complete';
    sectionsToGenerate?: SectionName[];
    className?: string;
    onPause?: () => void;
    onResume?: () => void;
    onRetrySection?: (section: SectionName) => void;
    onCancelGeneration?: () => void;
}

export function EnhancedProgressTracker({
    progress,
    mode,
    sectionsToGenerate = [],
    className,
    onPause,
    onResume,
    onRetrySection,
    onCancelGeneration
}: EnhancedProgressTrackerProps) {

    const [timeEstimates, setTimeEstimates] = useState<TimeEstimate | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [enhancedSectionProgress, setEnhancedSectionProgress] = useState<EnhancedSectionProgress[]>([]);
    const [realTimeUpdates, setRealTimeUpdates] = useState(true);

    // حساب تقديرات الوقت
    const calculateTimeEstimates = useCallback((): TimeEstimate => {
        const now = Date.now();
        const elapsedTime = now - (progress.startTime || now);

        if (mode === 'single') {
            const sectionInfo = SUPPORTED_SECTIONS[progress.currentSection as SectionName];
            const estimatedTime = sectionInfo?.estimatedTime || 15000; // 15 ثانية افتراضية

            return {
                estimatedTotal: estimatedTime,
                elapsedTime,
                remainingTime: Math.max(0, estimatedTime - elapsedTime),
                averageSectionTime: estimatedTime
            };
        }

        // للتقرير الكامل
        const completedSections = progress.completedSections?.length || 0;
        const totalSections = sectionsToGenerate.length;
        const avgTimePerSection = sectionsToGenerate.reduce((acc, section) => {
            return acc + (SUPPORTED_SECTIONS[section]?.estimatedTime || 15000);
        }, 0) / totalSections;

        const estimatedRemaining = (totalSections - completedSections) * avgTimePerSection;

        return {
            estimatedTotal: totalSections * avgTimePerSection,
            elapsedTime,
            remainingTime: estimatedRemaining,
            averageSectionTime: avgTimePerSection
        };
    }, [progress, mode, sectionsToGenerate]);

    // تحديث التقدم المحسن للأقسام
    const updateEnhancedSectionProgress = useCallback(() => {
        if (mode === 'complete' && progress.sectionProgress) {
            const enhanced: EnhancedSectionProgress[] = sectionsToGenerate.map(section => {
                const sectionProgress = progress.sectionProgress?.[section];
                const sectionInfo = SUPPORTED_SECTIONS[section];

                // حساب الوقت المتبقي للقسم
                const sectionElapsed = sectionProgress?.generationTime || 0;
                const estimatedTime = sectionInfo?.estimatedTime || 15000;
                const remainingTime = Math.max(0, estimatedTime - sectionElapsed);

                return {
                    section,
                    status: sectionProgress?.status || 'pending',
                    progress: sectionProgress?.progress || 0,
                    qualityScore: sectionProgress?.qualityScore,
                    generationTime: sectionProgress?.generationTime,
                    estimatedTime,
                    remainingTime,
                    iterations: sectionProgress?.iterations,
                    currentPhase: sectionProgress?.currentPhase || 'تمهيد',
                    modelUsed: sectionProgress?.modelUsed,
                    errorMessage: sectionProgress?.errorMessage
                };
            });

            setEnhancedSectionProgress(enhanced);
        }
    }, [progress.sectionProgress, mode, sectionsToGenerate]);

    // تحديث في الوقت الفعلي
    useEffect(() => {
        if (realTimeUpdates && progress.stage === 'generating') {
            const estimates = calculateTimeEstimates();
            setTimeEstimates(estimates);
            updateEnhancedSectionProgress();

            const interval = setInterval(() => {
                setTimeEstimates(calculateTimeEstimates());
                updateEnhancedSectionProgress();
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [realTimeUpdates, progress.stage, calculateTimeEstimates, updateEnhancedSectionProgress]);

    // تحديث تقديرات الوقت عند تغيير التقدم
    useEffect(() => {
        setTimeEstimates(calculateTimeEstimates());
        updateEnhancedSectionProgress();
    }, [progress, calculateTimeEstimates, updateEnhancedSectionProgress]);

    const formatTime = (ms: number) => {
        const seconds = Math.round(ms / 1000);
        if (seconds < 60) return `${seconds}ث`;
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) return `${minutes}د`;
        const hours = Math.round(minutes / 60);
        return `${hours}س`;
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'preparing':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'generating':
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'validating':
                return <Target className="h-4 w-4 text-yellow-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
            case 'generating': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
            case 'validating': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
            case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900';
            case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    const getPhaseName = (status: string) => {
        switch (status) {
            case 'preparing': return 'تمهيد';
            case 'generating': return 'توليد';
            case 'validating': return 'تحقق';
            case 'completed': return 'مكتمل';
            case 'error': return 'خطأ';
            default: return 'انتظار';
        }
    };

    const handlePauseResume = () => {
        if (isPaused) {
            setIsPaused(false);
            setRealTimeUpdates(true);
            onResume?.();
        } else {
            setIsPaused(true);
            setRealTimeUpdates(false);
            onPause?.();
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* لوحة التقدم الرئيسية المحسنة */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            {getStatusIcon(progress.stage)}
                            <span>تقدم التوليد المتقدم</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {progress.stage === 'generating' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePauseResume}
                                    className="flex items-center gap-1"
                                >
                                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                                    {isPaused ? 'متابعة' : 'إيقاف'}
                                </Button>
                            )}
                            {progress.stage === 'generating' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onCancelGeneration}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    إلغاء
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* شريط التقدم الرئيسي */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{progress.message}</span>
                                {isPaused && (
                                    <Badge variant="secondary">متوقف مؤقتاً</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{progress.percentage}%</span>
                                {timeEstimates && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Timer className="h-3 w-3" />
                                        {formatTime(timeEstimates.remainingTime)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Progress
                            value={progress.percentage}
                            className={`h-3 ${getProgressColor(progress.percentage)}`}
                        />
                    </div>

                    {/* معلومات الوقت */}
                    {timeEstimates && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {formatTime(timeEstimates.elapsedTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">وقت مضى</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Timer className="h-4 w-4 text-orange-500" />
                                </div>
                                <div className="text-lg font-semibold text-orange-600">
                                    {formatTime(timeEstimates.remainingTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">وقت متبقي</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                                <div className="text-lg font-semibold text-green-600">
                                    {formatTime(timeEstimates.averageSectionTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">متوسط لكل قسم</div>
                            </div>
                        </div>
                    )}

                    {/* مؤشرات النظام */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">نظام ذكي</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>تحسين تكراري</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span>جودة عالية</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-purple-500" />
                            <span>مراقبة أداء</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* تفاصيل الأقسام للتقرير الكامل المحسنة */}
            {mode === 'complete' && enhancedSectionProgress.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                            <span>تقدم الأقسام المفصل</span>
                            <Badge variant="outline">
                                {enhancedSectionProgress.filter(s => s.status === 'completed').length} من {enhancedSectionProgress.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {enhancedSectionProgress.map((sectionProgress, index) => {
                                const sectionInfo = SUPPORTED_SECTIONS[sectionProgress.section];

                                return (
                                    <div
                                        key={sectionProgress.section}
                                        className={`p-4 border rounded-lg transition-all ${sectionProgress.status === 'completed' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
                                            sectionProgress.status === 'generating' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950' :
                                                sectionProgress.status === 'validating' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' :
                                                    sectionProgress.status === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950' :
                                                        'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(sectionProgress.status)}
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {index + 1}. {sectionInfo?.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sectionProgress.currentPhase} - {sectionProgress.modelUsed ? `نموذج: ${sectionProgress.modelUsed}` : 'جاهز للبدء'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(sectionProgress.status)}>
                                                    {getPhaseName(sectionProgress.status)}
                                                </Badge>
                                                {progress.currentSection === sectionProgress.section && (
                                                    <Badge variant="secondary" className="text-xs animate-pulse">
                                                        نشط
                                                    </Badge>
                                                )}
                                                {sectionProgress.status === 'error' && onRetrySection && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onRetrySection(sectionProgress.section)}
                                                        className="text-xs"
                                                    >
                                                        إعادة المحاولة
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* تفاصيل إضافية للقسم النشط */}
                                        {(sectionProgress.status === 'generating' || sectionProgress.status === 'validating') && (
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="flex items-center justify-between text-xs mb-2">
                                                    <span>التقدم</span>
                                                    <span>{sectionProgress.progress}%</span>
                                                </div>
                                                <Progress value={sectionProgress.progress} className="h-2 mb-3" />

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                    {sectionProgress.estimatedTime && (
                                                        <div className="text-center">
                                                            <div className="font-medium text-blue-600">
                                                                {formatTime(sectionProgress.estimatedTime)}
                                                            </div>
                                                            <div className="text-muted-foreground">وقت مستهدف</div>
                                                        </div>
                                                    )}
                                                    {sectionProgress.remainingTime && (
                                                        <div className="text-center">
                                                            <div className="font-medium text-orange-600">
                                                                {formatTime(sectionProgress.remainingTime)}
                                                            </div>
                                                            <div className="text-muted-foreground">وقت متبقي</div>
                                                        </div>
                                                    )}
                                                    {sectionProgress.iterations && (
                                                        <div className="text-center">
                                                            <div className="font-medium text-purple-600">
                                                                {sectionProgress.iterations}
                                                            </div>
                                                            <div className="text-muted-foreground">تكرارات</div>
                                                        </div>
                                                    )}
                                                    {sectionProgress.qualityScore && (
                                                        <div className="text-center">
                                                            <div className={`font-medium ${sectionProgress.qualityScore >= 85 ? 'text-green-600' :
                                                                sectionProgress.qualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                                }`}>
                                                                {sectionProgress.qualityScore}/100
                                                            </div>
                                                            <div className="text-muted-foreground">الجودة</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* رسائل التقدم المتقدمة */}
            {progress.stage === 'generating' && !isPaused && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            <div>
                                <div className="font-medium text-blue-900 dark:text-blue-100">
                                    النظام الذكي يعمل بكامل طاقته
                                </div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    {mode === 'single'
                                        ? 'جاري تحليل السياق وتوليد المحتوى بجودة عالية مع التحسين التكراري'
                                        : `جاري توليد الأقسام بالترتيب الأمثل مع مراقبة الجودة في الوقت الفعلي`
                                    }
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isPaused && (
                <Alert>
                    <Pause className="h-4 w-4" />
                    <AlertDescription>
                        تم إيقاف التوليد مؤقتاً. انقر على "تصحيح" للمتابعة أو "إلغاء" لإيقاف العملية تماماً.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
