/**
 * لوحة التحسين التلقائي لجودة المحتوى
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { QualityImprovementService } from '@/services/quality-improvement-service';
import {
    CheckCircle,
    Info,
    RefreshCw,
    Settings,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface QualityImprovementPanelProps {
    content: string;
    contentType: 'section' | 'complete-report';
    sectionType?: string;
    onImprovementApplied?: (improvedContent: string, changes: string[]) => void;
    onQualityChange?: (qualityScore: number) => void;
    className?: string;
}

interface ImprovementOption {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    impact: 'low' | 'medium' | 'high';
    category: 'grammar' | 'style' | 'clarity' | 'structure' | 'consistency';
}

export function QualityImprovementPanel({
    content,
    contentType,
    sectionType,
    onImprovementApplied,
    onQualityChange,
    className
}: QualityImprovementPanelProps) {

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [currentQuality, setCurrentQuality] = useState<number | null>(null);
    const [improvedQuality, setImprovedQuality] = useState<number | null>(null);
    const [improvementOptions, setImprovementOptions] = useState<ImprovementOption[]>([
        {
            id: 'grammar',
            name: 'تحسين القواعد النحوية',
            description: 'تصحيح الأخطاء النحوية والإملائية',
            enabled: true,
            impact: 'high',
            category: 'grammar'
        },
        {
            id: 'style',
            name: 'توحيد الأسلوب',
            description: 'ضمان اتساق النبرة والأسلوب في جميع أنحاء المحتوى',
            enabled: true,
            impact: 'medium',
            category: 'style'
        },
        {
            id: 'clarity',
            name: 'تحسين الوضوح',
            description: 'تبسيط الجمل المعقدة وتحسين الوضوح',
            enabled: true,
            impact: 'high',
            category: 'clarity'
        },
        {
            id: 'structure',
            name: 'تنظيم البنية',
            description: 'إعادة تنظيم المحتوى وفقاً لأفضل الممارسات',
            enabled: false,
            impact: 'medium',
            category: 'structure'
        },
        {
            id: 'consistency',
            name: 'ضمان الاتساق',
            description: 'ضمان اتساق المفردات والمصطلحات مع باقي الأقسام',
            enabled: true,
            impact: 'medium',
            category: 'consistency'
        }
    ]);

    const [improvementLevel, setImprovementLevel] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
    const [targetScore, setTargetScore] = useState(85);
    const [lastAnalysis, setLastAnalysis] = useState<any>(null);
    const [improvementResult, setImprovementResult] = useState<{
        improvedContent: string;
        changes: string[];
        improvementReport: string;
        newQualityScore: number;
    } | null>(null);

    // تحليل جودة المحتوى عند التغيير
    const analyzeQuality = useCallback(async () => {
        if (!content || content.length < 50) return;

        setIsAnalyzing(true);
        try {
            const analysis = await QualityImprovementService.analyzeContentQuality(content, {
                type: contentType,
                sectionType,
                guidelines: []
            });

            setCurrentQuality(analysis.overallScore);
            setLastAnalysis(analysis);
            onQualityChange?.(analysis.overallScore);

        } catch (error) {
            console.error('خطأ في تحليل الجودة:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [content, contentType, sectionType, onQualityChange]);

    useEffect(() => {
        analyzeQuality();
    }, [analyzeQuality]);

    const applyImprovements = useCallback(async () => {
        if (!content || !lastAnalysis) return;

        setIsImproving(true);
        try {
            // فلترة الخيارات المحددة فقط
            const enabledOptions = improvementOptions.filter(opt => opt.enabled);

            // تحليل نوعي أفضل للمحتوى الحقيقي
            const analysis = await QualityImprovementService.analyzeContentQuality(content, {
                type: contentType,
                sectionType,
                guidelines: []
            });

            const result = await QualityImprovementService.autoImproveContent(content, analysis, {
                improvementLevel,
                targetScore
            });

            setImprovementResult(result);
            setImprovedQuality(result.newQualityScore);
            onImprovementApplied?.(result.improvedContent, result.changes);

        } catch (error) {
            console.error('خطأ في تطبيق التحسينات:', error);
        } finally {
            setIsImproving(false);
        }
    }, [content, lastAnalysis, improvementOptions, improvementLevel, targetScore, contentType, sectionType, onImprovementApplied]);

    const toggleOption = (optionId: string) => {
        setImprovementOptions(prev =>
            prev.map(opt =>
                opt.id === optionId ? { ...opt, enabled: !opt.enabled } : opt
            )
        );
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
            case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    const getQualityColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    if (!content || content.length < 50) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    أضف محتوى للتقرير لبدء التحسين التلقائي للجودة
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* حالة الجودة الحالية */}
            {isAnalyzing ? (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                            <span className="text-sm">جاري تحليل جودة المحتوى...</span>
                        </div>
                    </CardContent>
                </Card>
            ) : currentQuality !== null && (
                <Card className={currentQuality < 70 ? 'border-orange-200 bg-orange-50 dark:bg-orange-950' : 'border-blue-200 bg-blue-50 dark:bg-blue-950'}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            تقييم الجودة الحالية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">نقاط الجودة الإجمالية</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-semibold ${getQualityColor(currentQuality)}`}>
                                    {currentQuality}/100
                                </span>
                                <Badge className={currentQuality < 70 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                    currentQuality < 85 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}>
                                    {currentQuality < 70 ? 'يحتاج تحسين' :
                                        currentQuality < 85 ? 'جيد' : 'ممتاز'}
                                </Badge>
                            </div>
                        </div>

                        <Progress value={currentQuality} className="h-3" />

                        {lastAnalysis?.improvementAreas && lastAnalysis.improvementAreas.length > 0 && (
                            <div>
                                <div className="text-sm font-medium mb-2">مجالات التحسين</div>
                                <div className="flex gap-1 flex-wrap">
                                    {lastAnalysis.improvementAreas.map((area: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {area}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* إعدادات التحسين */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        إعدادات التحسين التلقائي
                    </CardTitle>
                    <CardDescription>
                        اختر خيارات التحسين التي تريد تطبيقها على المحتوى
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* مستوى التحسين */}
                    <div className="space-y-3">
                        <Label>مستوى التحسين</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={improvementLevel === 'conservative' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setImprovementLevel('conservative')}
                                className="flex-1"
                            >
                                محافظ
                            </Button>
                            <Button
                                variant={improvementLevel === 'moderate' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setImprovementLevel('moderate')}
                                className="flex-1"
                            >
                                معتدل
                            </Button>
                            <Button
                                variant={improvementLevel === 'aggressive' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setImprovementLevel('aggressive')}
                                className="flex-1"
                            >
                                جذري
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* الدرجة المستهدفة */}
                    <div className="space-y-3">
                        <Label>الدرجة المستهدفة للجودة</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>الدرجة المستهدفة</span>
                                <span className="font-medium">{targetScore}/100</span>
                            </div>
                            <Slider
                                value={[targetScore]}
                                onValueChange={([value]) => setTargetScore(value)}
                                max={100}
                                min={70}
                                step={5}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* خيارات التحسين */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">خيارات التحسين</Label>
                        <div className="space-y-3">
                            {improvementOptions.map(option => (
                                <div key={option.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                    <Checkbox
                                        checked={option.enabled}
                                        onCheckedChange={() => toggleOption(option.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">{option.name}</span>
                                            <Badge className={getImpactColor(option.impact)}>
                                                تأثير {option.impact === 'high' ? 'عالي' : option.impact === 'medium' ? 'متوسط' : 'منخفض'}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {option.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* تطبيق التحسينات */}
            <Card>
                <CardContent className="p-4">
                    <Button
                        onClick={applyImprovements}
                        disabled={isImproving || !improvementOptions.some(opt => opt.enabled)}
                        className="w-full flex items-center gap-2"
                    >
                        {isImproving ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                جاري تطبيق التحسينات...
                            </>
                        ) : (
                            <>
                                <Zap className="h-4 w-4" />
                                تطبيق التحسينات التلقائية
                            </>
                        )}
                    </Button>

                    {improvementOptions.filter(opt => opt.enabled).length === 0 && (
                        <div className="text-xs text-muted-foreground text-center mt-2">
                            اختر على الأقل خيار تحسين واحد للمتابعة
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* نتائج التحسين */}
            {improvementResult && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                            <CheckCircle className="h-5 w-5" />
                            نتائج التحسين التلقائي
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* تحسين الجودة */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm">تحسين الجودة</span>
                            <div className="flex items-center gap-2">
                                السابق: <span className={`text-sm ${getQualityColor(currentQuality || 0)}`}>{currentQuality}</span>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className={`font-semibold text-green-600`}>{improvedQuality}</span>
                                <Badge variant="outline" className="text-xs">
                                    +{(improvedQuality || 0) - (currentQuality || 0)}
                                </Badge>
                            </div>
                        </div>

                        <Progress
                            value={improvedQuality || 0}
                            className="h-3"
                        />

                        {/* التغييرات المطبقة */}
                        <div>
                            <div className="text-sm font-medium mb-2">التغييرات المطبقة</div>
                            <div className="space-y-1">
                                {improvementResult.changes.map((change, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>{change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* تقرير التحسين */}
                        <div className="text-sm text-green-800 dark:text-green-200">
                            {improvementResult.improvementReport}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* معلومات مفيدة */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    التحسين التلقائي يحسن جودة المحتوى بناءً على تحليل ذكي. يمكنك مراجعة التغييرات قبل قبولها أو رفضها.
                </AlertDescription>
            </Alert>
        </div>
    );
}
