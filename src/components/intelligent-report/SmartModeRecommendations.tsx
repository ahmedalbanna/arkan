/**
 * مكون التوصيات الذكية لاختيار الوضع المناسب
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SUPPORTED_SECTIONS } from '@/services/intelligent-report-service';
import {
    Brain,
    CheckCircle,
    Info,
    Lightbulb,
    Settings,
    Shuffle,
    Target,
    TrendingUp
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ModeRecommendationResult {
    recommendedMode: 'intelligent' | 'traditional' | 'hybrid';
    confidence: number;
    reasoning: string[];
    sectionRecommendations: Partial<Record<SectionName, {
        recommendedMode: 'intelligent' | 'traditional';
        reason: string;
        complexity: 'low' | 'medium' | 'high';
    }>>;
}

interface SmartModeRecommendationsProps {
    proposal?: any;
    projectPlan?: any;
    contextFiles?: Array<{ fileName: string; content: string; type: string }>;
    sectionsToGenerate?: SectionName[];
    guidelines?: string[];
    onModeSelected?: (mode: 'intelligent' | 'traditional' | 'hybrid') => void;
    onSectionModeChanged?: (section: SectionName, mode: 'intelligent' | 'traditional') => void;
    className?: string;
}

export function SmartModeRecommendations({
    proposal,
    projectPlan,
    contextFiles,
    sectionsToGenerate = [],
    guidelines,
    onModeSelected,
    onSectionModeChanged,
    className
}: SmartModeRecommendationsProps) {

    const [recommendation, setRecommendation] = useState<ModeRecommendationResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'intelligent' | 'traditional' | 'hybrid'>('traditional');
    const [sectionModes, setSectionModes] = useState<Partial<Record<SectionName, 'intelligent' | 'traditional'>>>({});

    // تحليل وتوليد التوصيات
    const analyzeAndRecommend = useCallback(async () => {
        if (!proposal && !projectPlan && (!contextFiles || contextFiles.length === 0)) {
            return;
        }

        setIsAnalyzing(true);

        try {
            // محاكاة استدعاء الخدمة الحقيقية (يجب استبدالها بـ API call)
            const mockRecommendation = await new Promise<ModeRecommendationResult>((resolve) => {
                setTimeout(() => {
                    // تحليل مبسط للمحتوى
                    let confidence = 0.5;
                    let recommendedMode: 'intelligent' | 'traditional' | 'hybrid' = 'traditional';
                    const reasoning: string[] = [];

                    if (proposal && JSON.stringify(proposal).length > 3000) {
                        confidence += 0.3;
                        reasoning.push('عرض تقديمي شامل ومفصل');
                    }

                    if (contextFiles && contextFiles.length >= 2) {
                        confidence += 0.2;
                        reasoning.push('محتوى غني ومتعدد المصادر');
                    }

                    if (sectionsToGenerate.length > 5) {
                        confidence += 0.15;
                        reasoning.push('عدد كبير من الأقسام يتطلب تنظيم ذكي');
                    }

                    if (contextFiles?.some(f => ['image', 'chart', 'diagram'].includes(f.type))) {
                        confidence += 0.1;
                        reasoning.push('محتوى بصري يتطلب تحليل متقدم');
                    }

                    if (confidence >= 0.7) {
                        recommendedMode = 'intelligent';
                    } else if (confidence >= 0.55 && sectionsToGenerate.some(s => ['methodology', 'analysis', 'conclusion'].includes(s))) {
                        recommendedMode = 'hybrid';
                        reasoning.push('أقسام متنوعة التعقيد');
                    }

                    // إنشاء توصيات الأقسام
                    const sectionRecommendations: Partial<Record<SectionName, any>> = {};
                    sectionsToGenerate.forEach(section => {
                        const info = SUPPORTED_SECTIONS[section];
                        sectionRecommendations[section] = {
                            recommendedMode: info.dependencies.length > 2 ? 'intelligent' : 'traditional',
                            reason: info.dependencies.length > 2 ? 'أقسام متعددة التبعيات' : 'أقسام بسيطة نسبياً',
                            complexity: info.dependencies.length > 2 ? 'high' :
                                info.dependencies.length > 0 ? 'medium' : 'low'
                        };
                    });

                    resolve({
                        recommendedMode,
                        confidence: Math.min(1, confidence),
                        reasoning,
                        sectionRecommendations
                    });
                }, 1500);
            });

            setRecommendation(mockRecommendation);
            setSelectedMode(mockRecommendation.recommendedMode);
            setSectionModes(mockRecommendation.sectionRecommendations);

        } catch (error) {
            console.error('خطأ في تحليل التوصيات:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [proposal, projectPlan, contextFiles, sectionsToGenerate]);

    useEffect(() => {
        analyzeAndRecommend();
    }, [analyzeAndRecommend]);

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'intelligent': return <Brain className="h-5 w-5 text-blue-500" />;
            case 'traditional': return <Settings className="h-5 w-5 text-gray-500" />;
            case 'hybrid': return <Shuffle className="h-5 w-5 text-purple-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'intelligent': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
            case 'traditional': return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
            case 'hybrid': return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
            case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    const handleModeChange = (mode: 'intelligent' | 'traditional' | 'hybrid') => {
        setSelectedMode(mode);
        onModeSelected?.(mode);
    };

    const handleSectionModeChange = (section: SectionName, mode: 'intelligent' | 'traditional') => {
        setSectionModes(prev => ({
            ...prev,
            [section]: mode
        }));
        onSectionModeChanged?.(section, mode);
    };

    if (isAnalyzing) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        تحليل الذكي للحصول على التوصيات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Progress value={65} className="h-2" />
                        <div className="text-sm text-muted-foreground text-center">
                            جاري تحليل المحتوى وتعقيد المشروع لإنتاج أفضل التوصيات...
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!recommendation) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    إضافة المحتوى وعرض التقرير للحصول على توصيات ذكية للوضع المناسب
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* التوصية الرئيسية */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                        <Lightbulb className="h-5 w-5" />
                        التوصية الذكية
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                        بناءً على تحليل المحتوى وتعقيد المشروع
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* الوضع المقترح */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getModeIcon(recommendation.recommendedMode)}
                            <div>
                                <div className="font-medium">
                                    الوضع المقترح: {recommendation.recommendedMode === 'intelligent' ? 'ذكي' :
                                        recommendation.recommendedMode === 'traditional' ? 'تقليدي' : 'مختلط'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    مستوى الثقة: {(recommendation.confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <Badge className={getModeColor(recommendation.recommendedMode)}>
                            {recommendation.confidence >= 0.8 ? 'مؤكد جداً' :
                                recommendation.confidence >= 0.6 ? 'مؤكد' :
                                    'محتمل'}
                        </Badge>
                    </div>

                    {/* شريط مستوى الثقة */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>مستوى الثقة في التوصية</span>
                            <span className="font-medium">{(recommendation.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={recommendation.confidence * 100} className="h-3" />
                    </div>

                    {/* أسباب التوصية */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">أسباب التوصية:</span>
                        </div>
                        <div className="space-y-2">
                            {recommendation.reasoning.map((reason, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* خيارات اختيار الوضع */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">اختر وضع التوليد</CardTitle>
                    <CardDescription>
                        يمكنك اختيار وضع مختلف وفقاً لاحتياجاتك
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                            variant={selectedMode === 'intelligent' ? 'default' : 'outline'}
                            onClick={() => handleModeChange('intelligent')}
                            className={`flex items-center gap-2 p-4 h-auto ${selectedMode === 'intelligent' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        >
                            <Brain className="h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">الوضع الذكي</div>
                                <div className="text-xs opacity-75">تحليل متقدم وتحسين تكراري</div>
                            </div>
                        </Button>

                        <Button
                            variant={selectedMode === 'traditional' ? 'default' : 'outline'}
                            onClick={() => handleModeChange('traditional')}
                            className={`flex items-center gap-2 p-4 h-auto ${selectedMode === 'traditional' ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                        >
                            <Settings className="h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">الوضع التقليدي</div>
                                <div className="text-xs opacity-75">سريع ومناسب للمشاريع البسيطة</div>
                            </div>
                        </Button>

                        <Button
                            variant={selectedMode === 'hybrid' ? 'default' : 'outline'}
                            onClick={() => handleModeChange('hybrid')}
                            className={`flex items-center gap-2 p-4 h-auto ${selectedMode === 'hybrid' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                        >
                            <Shuffle className="h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">الوضع المختلط</div>
                                <div className="text-xs opacity-75">ذكي للأقسام المعقدة وتقليدي للبسيطة</div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* توصيات الأقسام */}
            {selectedMode === 'hybrid' && Object.keys(recommendation.sectionRecommendations).length > 0 && (
                <>
                    <Separator />
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                توصيات الأقسام الفردية
                            </CardTitle>
                            <CardDescription>
                                لقد تم تحليل كل قسم وإعطاء توصية مناسبة بناءً على تعقيده
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sectionsToGenerate.map(section => {
                                    const info = SUPPORTED_SECTIONS[section];
                                    const sectionRecommendation = recommendation?.sectionRecommendations[section];

                                    if (!sectionRecommendation) return null;

                                    return (
                                        <div key={section} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {getModeIcon(sectionRecommendation.recommendedMode)}
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {info.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sectionRecommendation.reason}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getComplexityColor(sectionRecommendation.complexity)}>
                                                    تعقيد {sectionRecommendation.complexity === 'high' ? 'عالي' :
                                                        sectionRecommendation.complexity === 'medium' ? 'متوسط' : 'منخفض'}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSectionModeChange(section, sectionRecommendation.recommendedMode)}
                                                    className="text-xs"
                                                >
                                                    {sectionRecommendation.recommendedMode === 'intelligent' ? 'ذكي' : 'تقليدي'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
