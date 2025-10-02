/**
 * مولد التقارير الذكي المدمج مع وضع التقرير
 * يجمع بين النظام الذكي لتوليد التقارير و ReportResults
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntelligentReportMode } from '@/hooks/use-intelligent-report-mode';
import { cn } from '@/lib/utils';
import { SectionUtils } from '@/services/intelligent-report-service';
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    Brain,
    CheckCircle,
    Clock,
    FileText,
    Lightbulb,
    PanelRightOpen,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Star,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { GenerationTools } from './GenerationTools';
import { IntelligentReportResults } from './IntelligentReportResults';

// إضافة CSS للتحريكات
const animationStyles = `
@keyframes slideInFromLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInFromRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

/* الرسوم المتحركة تظهر مرة واحدة فقط ثم تختفي للأبد (forwards) */
.animate-slide-in-left {
    animation: slideInFromLeft 0.5s ease-out forwards;
}
.animate-slide-in-right {
    animation: slideInFromRight 0.5s ease-out forwards;
}
.animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
}
.animate-scale-in {
    animation: scaleIn 0.4s ease-out forwards;
}
/* pulse عادة متكرر، لكن إذا أردت لمرة واحدة فقط: */
.animate-pulse-gentle {
    animation: pulse 2s 1 forwards;
}

.animate-stagger > * {
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
}

.animate-stagger > *:nth-child(1) { animation-delay: 0.1s; }
.animate-stagger > *:nth-child(2) { animation-delay: 0.2s; }
.animate-stagger > *:nth-child(3) { animation-delay: 0.3s; }
.animate-stagger > *:nth-child(4) { animation-delay: 0.4s; }
.animate-stagger > *:nth-child(5) { animation-delay: 0.5s; }
`;

// إضافة الـ styles للصفحة
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    if (!document.head.querySelector('style[data-component="intelligent-report-animations"]')) {
        styleElement.setAttribute('data-component', 'intelligent-report-animations');
        document.head.appendChild(styleElement);
    }
}

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

/**
 * لوحة التوصيات الذكية
 */
function SmartRecommendationsPanel({
    recommendations,
    statistics,
    onAutoImprove,
    allGeneratedSections,
    improveText,
    project,
    className
}: {
    recommendations: any[];
    statistics: any;
    onAutoImprove: () => void;
    allGeneratedSections: SectionName[];
    improveText: (text: string, sectionType: SectionName) => Promise<any>;
    project: any;
    className?: string;
}) {
    if (recommendations.length === 0 && !statistics.needsImprovement) {
        return null;
    }

    return (
        <Card className={cn("border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    التوصيات الذكية
                </CardTitle>
                <CardDescription>
                    اقتراحات لتحسين جودة وكفاءة التقرير
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* أزرار الإجراءات السريعة */}
                <div className="flex flex-wrap items-center gap-2">
                    {statistics.needsImprovement && (
                        <Button
                            size="sm"
                            onClick={onAutoImprove}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <Target className="h-4 w-4 mr-2" />
                            تحسين الجودة التلقائي
                        </Button>
                    )}

                    {statistics.total > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                // فتح مساعد الكتابة للقسم الأول
                                const firstSection = allGeneratedSections[0];
                                if (firstSection) {
                                    improveText(project?.sections?.[firstSection] || '', firstSection);
                                }
                            }}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            مساعد الكتابة الذكي
                        </Button>
                    )}

                    {statistics.hasIntelligentSections && statistics.hasTraditionalSections && (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            نظام مختلط متوازن
                        </Badge>
                    )}
                </div>

                {/* قائمة التوصيات */}
                {recommendations.length > 0 && (
                    <div className="space-y-3">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border",
                                    rec.priority === 'high' ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' :
                                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' :
                                            'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
                                )}
                            >
                                <div className={cn(
                                    "p-1 rounded-full",
                                    rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900' :
                                        rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                                            'bg-gray-100 dark:bg-gray-900'
                                )}>
                                    {rec.type === 'quality' && <Target className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                    {rec.type === 'balance' && <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                                    {rec.type === 'cost' && <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium">{rec.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                                </div>
                                {rec.action && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={rec.action}
                                        className="flex-shrink-0"
                                    >
                                        تطبيق
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{statistics.total}</div>
                        <div className="text-xs text-muted-foreground">إجمالي الأقسام</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{statistics.averageIntelligentQuality.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">متوسط الجودة</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{statistics.lowQualitySections?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">يحتاج تحسين</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function IntelligentReportModeGenerator() {
    const [isVisible, setIsVisible] = useState(false);

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
        exportCompleteReport,
        previewSection,
        autoImproveQuality,
        getSmartRecommendations,
        improveText,
        saveVersion,
        restoreVersion,
        getSectionVersions,
        versionsHistory,
        isGenerating,
        project
    } = useIntelligentReportMode();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    if (!traditional.agentsLoaded) {
        return <ReportSkeleton />;
    }

    return (
        <div className={cn("h-full flex flex-col", isVisible && "animate-fade-in-up")} dir={traditional.locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* رأس الصفحة مع اختيار الوضع */}
            <Card className="mb-6 animate-slide-in-left">
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
                {/* مكون المقارنة والتحليل */}
                {statistics.total > 0 && statistics.hasIntelligentSections && statistics.hasTraditionalSections && (
                    <ReportComparison
                        allSections={allGeneratedSections}
                        sectionMetadata={sectionMetadata}
                        className="mb-6 animate-slide-in-right"
                    />
                )}

                {/* لوحة التوصيات الذكية */}
                {statistics.total > 0 && (
                    <SmartRecommendationsPanel
                        recommendations={getSmartRecommendations()}
                        statistics={statistics}
                        onAutoImprove={() => autoImproveQuality(80)}
                        allGeneratedSections={allGeneratedSections}
                        improveText={improveText}
                        project={project}
                        className="mb-6 animate-fade-in-up"
                    />
                )}

                {mode === 'intelligent' ? (
                    /* النظام الذكي الموحد */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                        {/* مولد التقارير الذكي الموحد */}
                        <div className="lg:col-span-5 space-y-6">
                            <UnifiedIntelligentGenerator
                                initialProposal={project?.proposal}
                                initialProjectPlan={project?.projectPlan}
                                onReportGenerated={handleIntelligentResult}
                                existingSections={allGeneratedSections}
                                sectionMetadata={sectionMetadata}
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
                                    onClick={() => exportCompleteReport('md')}
                                >
                                    <Zap className="h-4 w-4" />
                                    تصدير التقرير الكامل
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

/**
 * مولد التقارير الذكي الموحد
 * يدمج بين التقرير الفردي والكامل في واجهة واحدة
 */
function UnifiedIntelligentGenerator({
    initialProposal,
    initialProjectPlan,
    onReportGenerated,
    existingSections = [],
    sectionMetadata = {},
    className
}: {
    initialProposal?: any;
    initialProjectPlan?: any;
    onReportGenerated?: (result: any) => void;
    existingSections?: SectionName[];
    sectionMetadata?: Record<string, any>;
    className?: string;
}) {
    const [selectedSections, setSelectedSections] = useState<SectionName[]>([]);
    const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSection, setCurrentSection] = useState<string>('');
    const [qualityThreshold, setQualityThreshold] = useState(85);
    const [enableIterativeImprovement, setEnableIterativeImprovement] = useState(true);

    // قائمة الأقسام المتاحة مع معلومات محسنة
    const availableSections = [
        { id: 'abstract' as SectionName, name: 'المستخلص', category: 'مقدمة', priority: 1, estimatedTime: 2 },
        { id: 'acknowledgment' as SectionName, name: 'الشكر والتقدير', category: 'مقدمة', priority: 1, estimatedTime: 1 },
        { id: 'introduction' as SectionName, name: 'المقدمة', category: 'أساسي', priority: 2, estimatedTime: 3 },
        { id: 'literature-review' as SectionName, name: 'مراجعة الأدبيات', category: 'بحثي', priority: 3, estimatedTime: 5 },
        { id: 'system-analysis' as SectionName, name: 'تحليل النظام', category: 'تقني', priority: 4, estimatedTime: 4 },
        { id: 'design-strategy' as SectionName, name: 'استراتيجية التصميم', category: 'تقني', priority: 4, estimatedTime: 4 },
        { id: 'system-design' as SectionName, name: 'تصميم النظام', category: 'تقني', priority: 5, estimatedTime: 6 },
        { id: 'system-programming' as SectionName, name: 'برمجة النظام', category: 'تقني', priority: 5, estimatedTime: 5 },
        { id: 'system-testing' as SectionName, name: 'اختبار النظام', category: 'تقني', priority: 4, estimatedTime: 3 },
        { id: 'recommendations' as SectionName, name: 'التوصيات', category: 'خاتمة', priority: 3, estimatedTime: 2 },
        { id: 'conclusion' as SectionName, name: 'الخاتمة', category: 'خاتمة', priority: 2, estimatedTime: 2 },
        { id: 'references' as SectionName, name: 'المراجع', category: 'مراجع', priority: 1, estimatedTime: 1 },
        { id: 'appendices' as SectionName, name: 'الملاحق', category: 'مراجع', priority: 1, estimatedTime: 2 }
    ];

    // فلترة الأقسام حسب الفئة
    const sectionsByCategory = availableSections.reduce((acc, section) => {
        if (!acc[section.category]) acc[section.category] = [];
        acc[section.category].push(section);
        return acc;
    }, {} as Record<string, typeof availableSections>);

    // حساب الوقت المقدر
    const estimatedTime = selectedSections.reduce((total, sectionId) => {
        const section = availableSections.find(s => s.id === sectionId);
        return total + (section?.estimatedTime || 0);
    }, 0);

    // التحقق من الأقسام الموجودة
    const getExistingStatus = (sectionId: SectionName) => {
        if (existingSections.includes(sectionId)) {
            const metadata = sectionMetadata[sectionId];
            return {
                exists: true,
                isIntelligent: metadata?.isIntelligent || false,
                quality: metadata?.qualityScore || 0,
                canRegenerate: true
            };
        }
        return { exists: false, isIntelligent: false, quality: 0, canRegenerate: false };
    };

    // معالجة اختيار الأقسام
    const handleSectionToggle = (sectionId: SectionName) => {
        setSelectedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    // اختيار سريع
    const handleQuickSelect = (type: 'all' | 'missing' | 'low-quality' | 'academic' | 'technical') => {
        switch (type) {
            case 'all':
                setSelectedSections(availableSections.map(s => s.id));
                break;
            case 'missing':
                setSelectedSections(availableSections.filter(s => !existingSections.includes(s.id)).map(s => s.id));
                break;
            case 'low-quality':
                setSelectedSections(existingSections.filter(sectionId => {
                    const quality = sectionMetadata[sectionId]?.qualityScore || 0;
                    return quality < qualityThreshold;
                }));
                break;
            case 'academic':
                setSelectedSections(['abstract', 'introduction', 'literature-review', 'conclusion', 'references'].filter(s =>
                    availableSections.some(section => section.id === s)
                ) as SectionName[]);
                break;
            case 'technical':
                setSelectedSections(['system-analysis', 'design-strategy', 'system-design', 'system-programming', 'system-testing'].filter(s =>
                    availableSections.some(section => section.id === s)
                ) as SectionName[]);
                break;
        }
    };

    // توليد الأقسام
    const handleGenerate = async () => {
        if (selectedSections.length === 0) return;

        setIsGenerating(true);
        setProgress(0);

        try {
            // محاكاة التوليد (في التطبيق الفعلي ستكون مع API)
            for (let i = 0; i < selectedSections.length; i++) {
                const section = selectedSections[i];
                setCurrentSection(availableSections.find(s => s.id === section)?.name || section);
                setProgress(((i + 1) / selectedSections.length) * 100);

                // محاكاة وقت التوليد
                await new Promise(resolve => setTimeout(resolve, 1000));

                // إشعار النتيجة
                if (onReportGenerated) {
                    onReportGenerated({
                        singleSection: true,
                        sectionName: section,
                        content: `محتوى ${section} تم توليده بنجاح...`,
                        metadata: {
                            qualityScore: 85 + Math.random() * 15,
                            generationTime: 2000 + Math.random() * 3000,
                            isIntelligent: true,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            }
        } finally {
            setIsGenerating(false);
            setProgress(0);
            setCurrentSection('');
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    مولد التقارير الذكي الموحد
                </CardTitle>
                <CardDescription>
                    {generationMode === 'single' ? 'توليد قسم واحد' : 'توليد متعدد الأقسام'}
                    - تحكم كامل في جودة وإعدادات التوليد
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* التبديل بين الأنماط */}
                <Tabs value={generationMode} onValueChange={(value) => setGenerationMode(value as 'single' | 'batch')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            قسم واحد
                        </TabsTrigger>
                        <TabsTrigger value="batch" className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            أقسام متعددة
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="space-y-4">
                        <Alert>
                            <Target className="h-4 w-4" />
                            <AlertDescription>
                                اختر قسماً واحداً للتوليد المركز والسريع
                            </AlertDescription>
                        </Alert>
                    </TabsContent>

                    <TabsContent value="batch" className="space-y-4">
                        <Alert>
                            <Zap className="h-4 w-4" />
                            <AlertDescription>
                                اختر عدة أقسام للتوليد المتسلسل الذكي
                            </AlertDescription>
                        </Alert>
                    </TabsContent>
                </Tabs>

                {/* اختيار سريع */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">اختيار سريع:</h4>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleQuickSelect('missing')}>
                            الأقسام المفقودة ({availableSections.filter(s => !existingSections.includes(s.id)).length})
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleQuickSelect('low-quality')}>
                            جودة منخفضة ({existingSections.filter(s => (sectionMetadata[s]?.qualityScore || 0) < qualityThreshold).length})
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleQuickSelect('academic')}>
                            أكاديمي
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleQuickSelect('technical')}>
                            تقني
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleQuickSelect('all')}>
                            الكل
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedSections([])}>
                            مسح
                        </Button>
                    </div>
                </div>

                {/* قائمة الأقسام */}
                <div className="space-y-4">
                    {Object.entries(sectionsByCategory).map(([category, sections]) => (
                        <div key={category} className="space-y-2">
                            <h5 className="text-sm font-medium text-muted-foreground">{category}</h5>
                            <div className="grid grid-cols-1 gap-2">
                                {sections.map(section => {
                                    const status = getExistingStatus(section.id);
                                    const isSelected = selectedSections.includes(section.id);

                                    return (
                                        <div
                                            key={section.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                                                isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "hover:bg-muted",
                                                status.exists ? "border-l-4 border-l-green-500" : ""
                                            )}
                                            onClick={() => handleSectionToggle(section.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-4 h-4 rounded border-2 transition-colors",
                                                    isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                                )}>
                                                    {isSelected && <div className="w-full h-full rounded bg-white scale-50" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{section.name}</span>
                                                        {status.exists && (
                                                            <Badge variant={status.isIntelligent ? "default" : "secondary"} className="text-xs">
                                                                {status.isIntelligent ? 'ذكي' : 'تقليدي'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {section.estimatedTime} دقائق • أولوية {section.priority}
                                                        {status.exists && ` • جودة ${status.quality.toFixed(0)}/100`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {status.exists && status.quality < qualityThreshold && (
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                )}
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* إعدادات التوليد */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium">إعدادات التوليد</h4>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">حد الجودة المطلوب: {qualityThreshold}%</label>
                            <input
                                type="range"
                                min="70"
                                max="95"
                                value={qualityThreshold}
                                onChange={(e) => setQualityThreshold(Number(e.target.value))}
                                className="w-full mt-1"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="iterative"
                                checked={enableIterativeImprovement}
                                onChange={(e) => setEnableIterativeImprovement(e.target.checked)}
                            />
                            <label htmlFor="iterative" className="text-sm">تفعيل التحسين التكراري</label>
                        </div>
                    </div>
                </div>

                {/* ملخص وتوليد */}
                <div className="space-y-4">
                    {selectedSections.length > 0 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">ملخص التوليد</span>
                                <Badge>{selectedSections.length} قسم</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div>الوقت المقدر: {estimatedTime} دقيقة</div>
                                <div>التكلفة المقدرة: {selectedSections.length * 5} رصيد</div>
                                <div>حد الجودة: {qualityThreshold}%</div>
                            </div>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>جاري التوليد: {currentSection}</span>
                                <span>{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={handleGenerate}
                            disabled={selectedSections.length === 0 || isGenerating}
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    جاري التوليد...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    بدء التوليد
                                </>
                            )}
                        </Button>
                        {selectedSections.length > 0 && (
                            <Button variant="outline" onClick={() => setSelectedSections([])}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * مكون مقارنة وتحليل التقارير الذكي
 */
function ReportComparison({
    allSections,
    sectionMetadata,
    className
}: {
    allSections: SectionName[];
    sectionMetadata: Record<string, any>;
    className?: string;
}) {
    const intelligentSections = allSections.filter(s => sectionMetadata[s]?.isIntelligent);
    const traditionalSections = allSections.filter(s => !sectionMetadata[s]?.isIntelligent);

    // تحليل النظام الذكي
    const intelligentAnalysis = {
        count: intelligentSections.length,
        avgQuality: intelligentSections.length > 0
            ? intelligentSections.reduce((sum, s) => sum + (sectionMetadata[s]?.qualityScore || 0), 0) / intelligentSections.length
            : 0,
        avgTime: intelligentSections.length > 0
            ? intelligentSections.reduce((sum, s) => sum + (sectionMetadata[s]?.generationTime || 0), 0) / intelligentSections.length
            : 0,
        totalCost: intelligentSections.reduce((sum, s) => sum + (sectionMetadata[s]?.creditCost || 0), 0),
    };

    // تحليل النظام التقليدي
    const traditionalAnalysis = {
        count: traditionalSections.length,
        avgTime: 3000, // تقدير متوسط الوقت للنظام التقليدي
        estimatedQuality: 75, // تقدير متوسط الجودة للنظام التقليدي
    };

    const qualityGap = intelligentAnalysis.avgQuality - traditionalAnalysis.estimatedQuality;

    if (allSections.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-muted rounded-full">
                            <BarChart3 className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="font-medium">لا توجد بيانات للتحليل</h3>
                            <p className="text-sm">قم بتوليد بعض الأقسام أولاً لرؤية التحليل</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    تحليل الأداء والمقارنة
                </CardTitle>
                <CardDescription>
                    مقارنة شاملة بين النظام الذكي والتقليدي مع توصيات للتحسين
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-2">
                                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{intelligentAnalysis.count}</div>
                            <div className="text-sm text-muted-foreground">أقسام ذكية</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-2">
                                <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-2xl font-bold text-green-600">{traditionalAnalysis.count}</div>
                            <div className="text-sm text-muted-foreground">أقسام تقليدية</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto mb-2">
                                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-2xl font-bold text-purple-600">{intelligentAnalysis.avgQuality.toFixed(0)}</div>
                            <div className="text-sm text-muted-foreground">جودة ذكية</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full w-fit mx-auto mb-2">
                                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {qualityGap > 0 ? '+' : ''}{qualityGap.toFixed(0)}
                            </div>
                            <div className="text-sm text-muted-foreground">فجوة الجودة</div>
                        </CardContent>
                    </Card>
                </div>

                {/* مقارنة مفصلة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* النظام الذكي */}
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Brain className="h-5 w-5" />
                                النظام الذكي
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>متوسط الجودة</span>
                                    <Badge className={
                                        intelligentAnalysis.avgQuality >= 90 ? 'bg-green-500' :
                                            intelligentAnalysis.avgQuality >= 85 ? 'bg-blue-500' :
                                                intelligentAnalysis.avgQuality >= 80 ? 'bg-yellow-500' : 'bg-orange-500'
                                    }>
                                        {intelligentAnalysis.avgQuality.toFixed(1)}/100
                                    </Badge>
                                </div>
                                <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-blue-600"
                                        style={{ width: `${intelligentAnalysis.avgQuality}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>متوسط الوقت</span>
                                <span className="font-medium">
                                    {SectionUtils.formatEstimatedTime?.(intelligentAnalysis.avgTime) || `${intelligentAnalysis.avgTime.toFixed(0)}ms`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>إجمالي التكلفة</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {intelligentAnalysis.totalCost} رصيد
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* النظام التقليدي */}
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Settings className="h-5 w-5" />
                                النظام التقليدي
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>جودة متوقعة</span>
                                    <Badge variant="secondary">
                                        {traditionalAnalysis.estimatedQuality}/100
                                    </Badge>
                                </div>
                                <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-green-600"
                                        style={{ width: `${traditionalAnalysis.estimatedQuality}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>وقت متوقع</span>
                                <span className="font-medium">
                                    {SectionUtils.formatEstimatedTime?.(traditionalAnalysis.avgTime) || `${traditionalAnalysis.avgTime}ms`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>التكلفة</span>
                                <span className="font-medium text-green-600">
                                    مجاني
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* التوصيات */}
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                            <Lightbulb className="h-5 w-5" />
                            توصيات ذكية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {qualityGap > 15 && (
                                <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">النظام الذكي يحقق جودة أعلى بـ {qualityGap.toFixed(1)} نقطة - يُنصح باستخدامه للأقسام المهمة</span>
                                </div>
                            )}
                            {intelligentAnalysis.avgTime > traditionalAnalysis.avgTime * 2 && (
                                <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <Clock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">النظام التقليدي أسرع - استخدمه للأقسام البسيطة لتوفير الوقت</span>
                                </div>
                            )}
                            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">اجمع بين النظامين: استخدم الذكي للتحليل والتصميم، والتقليدي للمراجع والشكر</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
