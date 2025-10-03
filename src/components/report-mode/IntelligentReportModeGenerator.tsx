/**
 * مولد التقارير الذكي المدمج مع وضع التقرير
 * يجمع بين النظام الذكي لتوليد التقارير و ReportResults
 */

'use client';

import { IntelligentReportGenerator } from '@/components/intelligent-report/IntelligentReportGenerator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntelligentReportMode } from '@/hooks/use-intelligent-report-mode';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    Brain,
    CheckCircle,
    Clock,
    FileText,
    PanelRightOpen,
    Settings,
    Zap
} from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { GenerationTools } from './GenerationTools';
import { IntelligentReportResults } from './IntelligentReportResults';

function ReportSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            <div className="lg:col-span-4">
                <Skeleton className="h-[calc(100vh-200px)]" />
            </div>
            <div className="lg:col-span-8">
                <Skeleton className="h-[calc(100vh-200px)]" />
            </div>
        </div>
    );
}

export default function IntelligentReportModeGenerator() {
    const {
        mode,
        setMode,
        allGeneratedSections,
        sectionMetadata,
        statistics,
        traditional,
        handleIntelligentResult,
        regenerateSection,
        exportSection,
        previewSection,
        isGenerating,
        project
    } = useIntelligentReportMode();

    if (!traditional.agentsLoaded) {
        return <ReportSkeleton />;
    }

    return (
        <div className="h-full flex flex-col" dir={traditional.locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* رأس الصفحة مع اختيار الوضع */}
            <Card className="mb-6">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">مولد التقارير المتقدم</CardTitle>
                                <CardDescription>
                                    اختر بين النظام الذكي المتقدم أو الأدوات التقليدية
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {statistics.total > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    {statistics.total} قسم مولد
                                    {statistics.hasIntelligentSections && (
                                        <Badge variant="outline" className="text-xs">
                                            <Brain className="h-3 w-3 mr-1" />
                                            {statistics.intelligent} ذكي
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <Tabs value={mode} onValueChange={(value) => setMode(value as 'traditional' | 'intelligent')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="intelligent" className="flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                النظام الذكي
                            </TabsTrigger>
                            <TabsTrigger value="traditional" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                الأدوات التقليدية
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {/* المحتوى الرئيسي */}
            <div className="flex-1 flex flex-col">
                {mode === 'intelligent' ? (
                    /* النظام الذكي */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                        {/* مولد التقارير الذكي */}
                        <div className="lg:col-span-5 space-y-6">
                            <IntelligentReportGenerator
                                initialProposal={project?.proposal}
                                initialProjectPlan={project?.projectPlan}
                                onReportGenerated={handleIntelligentResult}
                            />
                        </div>

                        {/* النتائج */}
                        <div className="lg:col-span-7">
                            <Suspense fallback={<ReportSkeleton />}>
                                <IntelligentReportResults
                                    generatedSections={allGeneratedSections}
                                    sectionMetadata={sectionMetadata}
                                    onRegenerateSection={regenerateSection}
                                    onExportSection={exportSection}
                                    onPreviewSection={previewSection}
                                />
                            </Suspense>
                        </div>
                    </div>
                ) : (
                    /* الأدوات التقليدية */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                        {traditional.isPanelCollapsed && (
                            <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
                                <Button
                                    variant="secondary"
                                    className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                                    onClick={() => traditional.setIsPanelCollapsed(false)}
                                >
                                    <PanelRightOpen className="h-5 w-5 mb-2" />
                                    Generation Tools
                                </Button>
                            </div>
                        )}
                        <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", traditional.isPanelCollapsed && "lg:hidden")}>
                            <GenerationTools
                                onCollapseToggle={() => traditional.setIsPanelCollapsed(true)}
                                orderedSections={traditional.orderedSections}
                                setOrderedSections={traditional.setOrderedSections}
                                isAnythingGenerating={traditional.isAnythingGenerating}
                                activeMutationKey={traditional.activeMutationKey}
                                onGenerateSection={traditional.onGenerateSection}
                                hasCreditsForSingleSection={traditional.hasCreditsForSingleSection}
                                agents={traditional.agents}
                            />
                        </div>

                        <div className={cn("lg:overflow-y-auto pr-2", traditional.isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                            <Suspense fallback={<ReportSkeleton />}>
                                <IntelligentReportResults
                                    generatedSections={allGeneratedSections}
                                    sectionMetadata={sectionMetadata}
                                    onRegenerateSection={regenerateSection}
                                    onExportSection={exportSection}
                                    onPreviewSection={previewSection}
                                />
                            </Suspense>
                        </div>
                    </div>
                )}
            </div>

            {/* شريط المقارنة السريعة */}
            {statistics.total > 0 && (
                <Card className="mt-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">
                                        {statistics.total} قسم مولد
                                    </span>
                                </div>
                                {statistics.hasIntelligentSections && (
                                    <div className="flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm text-purple-600">
                                            {statistics.intelligent} ذكي
                                        </span>
                                    </div>
                                )}
                                {isGenerating && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-amber-600 animate-spin" />
                                        <span className="text-sm text-amber-600">
                                            جاري التوليد...
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMode(mode === 'intelligent' ? 'traditional' : 'intelligent')}
                                    className="flex items-center gap-2"
                                >
                                    {mode === 'intelligent' ? (
                                        <>
                                            <Settings className="h-4 w-4" />
                                            التبديل للأدوات التقليدية
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4" />
                                            التبديل للنظام الذكي
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => {
                                        // تصدير جميع الأقسام
                                        allGeneratedSections.forEach(section => {
                                            exportSection(section);
                                        });
                                    }}
                                >
                                    <Zap className="h-4 w-4" />
                                    تصدير التقرير
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
