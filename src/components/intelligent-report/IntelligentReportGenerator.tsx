/**
 * مكون ذكي لتوليد التقارير باستخدام النظام الجديد
 * يدعم جميع ميزات النظام الذكي مع واجهة مستخدم متقدمة
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useCompleteReport,
    useIntelligentSection,
    usePerformanceMonitoring,
    useRealTimePerformance,
    useReportBuilder
} from '@/hooks/use-intelligent-report';
import { useReportValidation } from '@/hooks/use-report-validation';
import { SectionUtils } from '@/services/intelligent-report-service';
import {
    AlertCircle,
    Brain,
    Clock,
    FileText,
    Pause,
    Play,
    RotateCcw,
    Target,
    Zap
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { IntelligentReportResults } from '../report-mode/IntelligentReportResults';
import { PerformanceDashboard } from './PerformanceDashboard';
import { ProgressTracker } from './ProgressTracker';
import { QualityIndicator } from './QualityIndicator';
import { ReportConfigPanel } from './ReportConfigPanel';
import { SectionSelector } from './SectionSelector';
import { ValidationInstructions } from './ValidationInstructions';
interface IntelligentReportGeneratorProps {
    initialProposal?: any;
    initialProjectPlan?: any;
    onReportGenerated?: (result: any) => void;
    className?: string;
}

export function IntelligentReportGenerator({
    initialProposal,
    initialProjectPlan,
    onReportGenerated,
    className
}: IntelligentReportGeneratorProps) {
    const [mode, setMode] = useState<'single' | 'complete'>('complete');
    const [selectedSingleSection, setSelectedSingleSection] = useState<SectionName>('introduction');

    const reportBuilder = useReportBuilder();
    const performanceMonitoring = usePerformanceMonitoring();
    const realTimePerformance = useRealTimePerformance();

    // التحقق من صحة المدخلات
    const validation = useReportValidation({
        operationType: mode === 'single' ? 'single-section' : 'complete-report',
        sectionToGenerate: mode === 'single' ? selectedSingleSection : undefined,
        sectionsToGenerate: mode === 'complete' ? reportBuilder.selectedSections : undefined,
        proposal: reportBuilder.reportConfig.proposal || initialProposal,
        projectPlan: reportBuilder.reportConfig.projectPlan || initialProjectPlan,
        guidelines: reportBuilder.reportConfig.guidelines,
        contextFiles: reportBuilder.reportConfig.contextFiles,
        otherSections: reportBuilder.sectionResults as any,
        instructionText: ''
    });

    // إعداد التقرير الكامل
    const completeReport = useCompleteReport({
        sectionsToGenerate: reportBuilder.selectedSections,
        proposal: reportBuilder.reportConfig.proposal || initialProposal,
        projectPlan: reportBuilder.reportConfig.projectPlan || initialProjectPlan,
        guidelines: reportBuilder.reportConfig.guidelines,
        contextFiles: reportBuilder.reportConfig.contextFiles,
        qualityThreshold: reportBuilder.reportConfig.qualityThreshold,
        enableIterativeImprovement: reportBuilder.reportConfig.enableIterativeImprovement,
        enablePerformanceMonitoring: reportBuilder.reportConfig.enablePerformanceMonitoring,
        generateInOrder: true,
        useIntelligentDependencies: true,
        onSuccess: (result) => {
            onReportGenerated?.(result);
        },
        onProgress: (progress) => {
            // تحديث مقاييس الأداء في الوقت الفعلي
            if (progress.stage === 'generating') {
                realTimePerformance.incrementActiveGenerations();
            } else if (progress.stage === 'completed' || progress.stage === 'error') {
                realTimePerformance.decrementActiveGenerations();
            }
        }
    });

    // إعداد القسم الفردي
    const singleSection = useIntelligentSection({
        sectionToGenerate: selectedSingleSection,
        proposal: reportBuilder.reportConfig.proposal || initialProposal,
        projectPlan: reportBuilder.reportConfig.projectPlan || initialProjectPlan,
        guidelines: reportBuilder.reportConfig.guidelines,
        contextFiles: reportBuilder.reportConfig.contextFiles,
        otherSections: reportBuilder.sectionResults as any,
        qualityThreshold: reportBuilder.reportConfig.qualityThreshold,
        enableIterativeImprovement: reportBuilder.reportConfig.enableIterativeImprovement,
        enablePerformanceMonitoring: reportBuilder.reportConfig.enablePerformanceMonitoring,
        onSuccess: (result) => {
            reportBuilder.updateSectionResult(selectedSingleSection, result);
            onReportGenerated?.(result);
        }
    });

    // دالة بدء التوليد
    const handleGenerate = useCallback(() => {
        if (mode === 'complete') {
            completeReport.generateReport();
        } else {
            singleSection.generateSection();
        }
    }, [mode, completeReport.generateReport, singleSection.generateSection]);

    // دالة إعادة التعيين
    const handleReset = useCallback(() => {
        if (mode === 'complete') {
            completeReport.reset();
        } else {
            singleSection.reset();
        }
        reportBuilder.clearResults();
    }, [mode, completeReport.reset, singleSection.reset, reportBuilder.clearResults]);

    // حالة التوليد الحالية
    const isGenerating = mode === 'complete' ? completeReport.isGenerating : singleSection.isGenerating;
    const currentProgress = mode === 'complete' ? completeReport.progress : singleSection.progress;
    const canGenerate = validation.canGenerate && !isGenerating;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* رأس المولد */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">مولد التقارير الذكي</CardTitle>
                                <CardDescription>
                                    نظام متقدم لتوليد التقارير المهنية بالذكاء الاصطناعي
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={realTimePerformance.isSystemHealthy ? "default" : "destructive"}>
                                {realTimePerformance.isSystemHealthy ? "النظام سليم" : "تحميل عالي"}
                            </Badge>
                            {realTimePerformance.metrics.activeGenerations > 0 && (
                                <Badge variant="secondary">
                                    {realTimePerformance.metrics.activeGenerations} عملية نشطة
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* تعليمات التحقق من صحة المدخلات */}
            {!validation.canGenerate && (
                <ValidationInstructions
                    validation={validation}
                    onAddContext={() => {
                        // يمكن إضافة منطق فتح حوار إضافة السياق
                    }}
                    onAddProjectInfo={() => {
                        // يمكن إضافة منطق فتح حوار معلومات المشروع
                    }}
                    onUploadFiles={() => {
                        // يمكن إضافة منطق رفع الملفات
                    }}
                    onConfigureSettings={() => {
                        // يمكن إضافة منطق التركيز على لوحة الإعدادات
                    }}
                />
            )}

            {/* لوحة التحكم الرئيسية */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'single' | 'complete')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        قسم فردي
                    </TabsTrigger>
                    <TabsTrigger value="complete" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        تقرير كامل
                    </TabsTrigger>
                </TabsList>

                {/* توليد قسم فردي */}
                <TabsContent value="single" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                توليد قسم فردي
                            </CardTitle>
                            <CardDescription>
                                توليد قسم واحد بجودة عالية باستخدام النظام الذكي
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* اختيار القسم */}
                            <SectionSelector
                                selectedSections={[selectedSingleSection]}
                                onSectionChange={(sections) => setSelectedSingleSection(sections[0])}
                                mode="single"
                                sectionResults={reportBuilder.sectionResults}
                            />

                            {/* معلومات القسم */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            الوقت المتوقع
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {singleSection.estimatedTime}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Target className="h-4 w-4" />
                                            عتبة الجودة
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {singleSection.sectionInfo.qualityThreshold}/100
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Zap className="h-4 w-4" />
                                            التكلفة
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {singleSection.estimatedCost} رصيد
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* تتبع التقدم */}
                            {isGenerating && (
                                <ProgressTracker
                                    progress={currentProgress}
                                    mode="single"
                                />
                            )}

                            {/* النتائج */}
                            {singleSection.result && (
                                <QualityIndicator
                                    result={singleSection.result}
                                    mode="single"
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* توليد تقرير كامل */}
                <TabsContent value="complete" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* اختيار الأقسام */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        اختيار أقسام التقرير
                                    </CardTitle>
                                    <CardDescription>
                                        اختر الأقسام التي تريد تضمينها في التقرير
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SectionSelector
                                        selectedSections={reportBuilder.selectedSections}
                                        onSectionChange={(sections) => {
                                            // تحديث الأقسام المختارة
                                            const currentSections = new Set(reportBuilder.selectedSections);
                                            const newSections = new Set(sections);

                                            // إضافة الأقسام الجديدة
                                            newSections.forEach(section => {
                                                if (!currentSections.has(section)) {
                                                    reportBuilder.addSection(section);
                                                }
                                            });

                                            // إزالة الأقسام المحذوفة
                                            currentSections.forEach(section => {
                                                if (!newSections.has(section)) {
                                                    reportBuilder.removeSection(section);
                                                }
                                            });
                                        }}
                                        mode="multiple"
                                        sectionResults={reportBuilder.sectionResults}
                                        dependencyValidation={reportBuilder.dependencyValidation}
                                    />
                                </CardContent>
                            </Card>

                            {/* تتبع التقدم للتقرير الكامل */}
                            {isGenerating && (
                                <ProgressTracker
                                    progress={currentProgress}
                                    mode="complete"
                                    sectionsToGenerate={reportBuilder.selectedSections}
                                />
                            )}

                            {/* نتائج التقرير الكامل */}
                            {completeReport.result && (
                                <QualityIndicator
                                    result={completeReport.result}
                                    mode="complete"
                                    qualityAnalysis={completeReport.qualityAnalysis || undefined}
                                />
                            )}
                        </div>

                        {/* لوحة الإعدادات والمعلومات */}
                        <div className="space-y-4">
                            {/* إعدادات التقرير */}
                            <ReportConfigPanel
                                config={reportBuilder.reportConfig}
                                onConfigChange={reportBuilder.updateConfig}
                                estimates={reportBuilder.estimates}
                                estimatedCost={reportBuilder.estimatedCost}
                                onAddProjectInfo={() => {
                                    // يمكن إضافة منطق مخصص هنا إذا لزم الأمر
                                }}
                                onUploadFiles={() => {
                                    // يمكن إضافة منطق رفع الملفات هنا
                                }}
                            />

                            {/* لوحة الأداء */}
                            <PerformanceDashboard
                                stats={performanceMonitoring.stats}
                                realTimeMetrics={realTimePerformance.metrics}
                                isLoading={performanceMonitoring.isLoading}
                                onRefresh={performanceMonitoring.refreshStats}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* أزرار التحكم */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={!canGenerate || isGenerating}
                                size="lg"
                                className="flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Pause className="h-4 w-4" />
                                        جاري التوليد...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4" />
                                        بدء التوليد
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleReset}
                                variant="outline"
                                disabled={isGenerating}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                إعادة تعيين
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {mode === 'complete' && reportBuilder.selectedSections.length > 0 && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <FileText className="h-4 w-4" />
                                        {reportBuilder.selectedSections.length} قسم
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        ~{SectionUtils.formatEstimatedTime(reportBuilder.estimates.totalEstimatedTime)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Zap className="h-4 w-4" />
                                        {reportBuilder.estimatedCost} رصيد
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* تحذيرات التبعيات */}
                    {mode === 'complete' && !reportBuilder.dependencyValidation.isValid && (
                        <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                بعض الأقسام تحتاج لأقسام أخرى لم يتم اختيارها.
                                يُنصح باتباع الترتيب الموصى به للحصول على أفضل النتائج.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* شريط التقدم العام */}
                    {isGenerating && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>{currentProgress.message}</span>
                                <span>{currentProgress.percentage}%</span>
                            </div>
                            <Progress value={currentProgress.percentage} className="h-2" />
                        </div>
                    )}
                </CardContent>
            </Card>

            <IntelligentReportResults
                generatedSections={reportBuilder.selectedSections}
                sectionMetadata={reportBuilder.sectionResults as any}
            />
        </div>
    );
}
