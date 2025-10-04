/**
 * مكون تكوين الوضع المختلط للتقارير
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { SUPPORTED_SECTIONS } from '@/services/intelligent-report-service';
import {
    Brain,
    Clock,
    Info,
    Settings,
    Target,
    ToggleLeft,
    ToggleRight,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface HybridModeConfig {
    enabled: boolean;
    sectionModes: Record<SectionName, 'intelligent' | 'traditional'>;
    intelligentThreshold: number;
    fallbackToTraditional: boolean;
}

interface HybridModeConfigProps {
    sectionsToGenerate: SectionName[];
    currentConfig?: HybridModeConfig;
    onConfigChange: (config: HybridModeConfig) => void;
    className?: string;
}

export function HybridModeConfig({
    sectionsToGenerate,
    currentConfig,
    onConfigChange,
    className
}: HybridModeConfigProps) {

    const [config, setConfig] = useState<HybridModeConfig>(currentConfig || {
        enabled: false,
        sectionModes: {},
        intelligentThreshold: 7,
        fallbackToTraditional: true
    });

    const [analysisResults, setAnalysisResults] = useState<{
        intelligentSections: SectionName[];
        traditionalSections: SectionName[];
        estimatedCost: number;
        estimatedTime: number;
        qualityImprovement: number;
    } | null>(null);

    // تحليل تلقائي عند تغيير الإعدادات
    useEffect(() => {
        if (config.enabled) {
            analyzeImpact();
        } else {
            setAnalysisResults(null);
        }
    }, [config, sectionsToGenerate]);

    const analyzeImpact = useCallback(() => {
        // محاكاة التحليل الذكي
        const intelligentCount = Object.values(config.sectionModes).filter(mode => mode === 'intelligent').length;
        const traditionalCount = sectionsToGenerate.length - intelligentCount;

        const intelligentCost = intelligentCount * 1;
        const traditionalCost = traditionalCount * 0.5;
        const hybridDiscount = 0.8; // خصم 20% للوضع المختلط

        const estimatedSectionsTime = intelligentCount * 15000 + traditionalCount * 8000; // ms
        const qualityImprovement = Math.min(20, intelligentCount * 2); // تحسين %5 لكل قسم ذكي

        setAnalysisResults({
            intelligentSections: sectionsToGenerate.filter(s => config.sectionModes[s] === 'intelligent'),
            traditionalSections: sectionsToGenerate.filter(s => config.sectionModes[s] === 'traditional'),
            estimatedCost: Math.ceil((intelligentCost + traditionalCost) * hybridDiscount),
            estimatedTime: estimatedSectionsTime,
            qualityImprovement
        });
    }, [config, sectionsToGenerate]);

    const toggleHybridMode = (enabled: boolean) => {
        const newConfig = { ...config, enabled };

        if (enabled) {
            // تعيين أولي للوضع بناءً على التعقيد
            const initialSectionModes: Record<SectionName, 'intelligent' | 'traditional'> = {};
            sectionsToGenerate.forEach(section => {
                const complexity = SUPPORTED_SECTIONS[section]?.complexityScore || 5;
                initialSectionModes[section] = complexity >= config.intelligentThreshold ? 'intelligent' : 'traditional';
            });
            newConfig.sectionModes = initialSectionModes;
        }

        setConfig(newConfig);
        onConfigChange(newConfig);
    };

    const updateSectionMode = (section: SectionName, mode: 'intelligent' | 'traditional') => {
        const newConfig = {
            ...config,
            sectionModes: {
                ...config.sectionModes,
                [section]: mode
            }
        };
        setConfig(newConfig);
        onConfigChange(newConfig);
    };

    const updateThreshold = (threshold: number) => {
        const newConfig = { ...config, intelligentThreshold: threshold };

        // إعادة تطبيق المرشح على الأقسام التي لم يتم تعيينها يدوياً
        if (config.fallbackToTraditional) {
            sectionsToGenerate.forEach(section => {
                const complexity = SUPPORTED_SECTIONS[section]?.complexityScore || 5;
                const autoMode = complexity >= threshold ? 'intelligent' : 'traditional';

                // إذا لم يتم تعيين الوضع يدوياً، استخدم المحلل الآلي
                if (!config.sectionModes[section]) {
                    newConfig.sectionModes = {
                        ...newConfig.sectionModes,
                        [section]: autoMode
                    };
                }
            });
        }

        setConfig(newConfig);
        onConfigChange(newConfig);
    };

    const getModeIcon = (mode: string) => {
        return mode === 'intelligent' ?
            <Brain className="h-4 w-4 text-blue-500" /> :
            <Settings className="h-4 w-4 text-gray-500" />;
    };

    const getModeLabel = (mode: string) => {
        return mode === 'intelligent' ? 'ذكي' : 'تقليدي';
    };

    const getComplexityColor = (complexity: number) => {
        if (complexity >= 8) return 'text-red-600 bg-red-100 dark:bg-red-900';
        if (complexity >= 6) return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
        if (complexity >= 4) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
        return 'text-green-600 bg-green-100 dark:bg-green-900';
    };

    const formatTime = (ms: number) => {
        const seconds = Math.round(ms / 1000);
        if (seconds < 60) return `${seconds}ث`;
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) return `${minutes}د`;
        return `${Math.round(minutes / 60)}س`;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* تنظير الوضع المختلط */}
            <Card className={config.enabled ? 'border-purple-200 bg-purple-50 dark:bg-purple-950' : ''}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-500" />
                            الوضع المختلط
                        </CardTitle>
                        <Button
                            variant="outline"
                            onClick={() => toggleHybridMode(!config.enabled)}
                            className="flex items-center gap-2"
                        >
                            {config.enabled ? (
                                <>
                                    <ToggleRight className="h-4 w-4" />
                                    مفعل
                                </>
                            ) : (
                                <>
                                    <ToggleLeft className="h-4 w-4" />
                                    معطل
                                </>
                            )}
                        </Button>
                    </div>
                    <CardDescription>
                        اتلق الأمثل بين السرعة والجودة باستخدام الوضع الذكي للأقسام المعقدة والوضع التقليدي للأقسام البسيطة
                    </CardDescription>
                </CardHeader>
            </Card>

            {config.enabled && (
                <>
                    {/* إعدادات الوضع المختلط */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                إعدادات الوضع المختلط
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* عتبة التبديل الذكي */}
                            <div className="space-y-3">
                                <Label>عتبة التبديل للوضع الذكي</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>أقسام بسيطة</span>
                                        <span className="font-medium">{config.intelligentThreshold}/10</span>
                                        <span>أقسام معقدة</span>
                                    </div>
                                    <Slider
                                        value={[config.intelligentThreshold]}
                                        onValueChange={([threshold]) => updateThreshold(threshold)}
                                        max={10}
                                        min={0}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Info className="h-3 w-3" />
                                        <span>الأقسام التي تتجاوز هذه العتبة ستولد بالوضع الذكي بشكل افتراضي</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* خيارات إضافية */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>التبديل التلقائي</Label>
                                        <div className="text-xs text-muted-foreground">
                                            استخدام التحديد الآلي للوضع بناءً على التعقيد
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newConfig = { ...config, fallbackToTraditional: !config.fallbackToTraditional };
                                            setConfig(newConfig);
                                            onConfigChange(newConfig);
                                        }}
                                    >
                                        {config.fallbackToTraditional ? 'مفعل' : 'معطل'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* تكوين الأقسام */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                تكوين أقسام التقرير
                            </CardTitle>
                            <CardDescription>
                                تعيين الوضع المناسب لكل قسم بناءً على احتياجاتك
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sectionsToGenerate.map((section, index) => {
                                    const sectionInfo = SUPPORTED_SECTIONS[section];
                                    const complexity = sectionInfo?.complexityScore || 5;
                                    const currentMode = config.sectionModes[section] || 'traditional';

                                    return (
                                        <div
                                            key={section}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getModeIcon(currentMode)}
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {index + 1}. {sectionInfo?.title || section}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sectionInfo?.description || `وصف القسم ${section}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getComplexityColor(complexity)}>
                                                    تعقيد {complexity}/10
                                                </Badge>
                                                <Button
                                                    variant={currentMode === 'intelligent' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => updateSectionMode(section, 'intelligent')}
                                                    className={currentMode === 'intelligent' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                                >
                                                    <Brain className="h-3 w-3" />
                                                    ذكي
                                                </Button>
                                                <Button
                                                    variant={currentMode === 'traditional' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => updateSectionMode(section, 'traditional')}
                                                    className={currentMode === 'traditional' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                                                >
                                                    <Settings className="h-3 w-3" />
                                                    تقليدي
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* تحليل التأثير */}
                    {analysisResults && (
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <TrendingUp className="h-5 w-5" />
                                    تحليل تأثير الوضع المختلط
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* التوزيع */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <div className="text-lg font-semibold text-blue-600">
                                            {analysisResults.intelligentSections.length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">أقسام ذكية</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                        <div>{analysisResults.traditionalSections.length}</div>
                                        <div className="text-sm text-muted-foreground">أقسام تقليدية</div>
                                    </div>
                                </div>

                                {/* التوقعات */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">الوقت المتوقع</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-green-500" />
                                            <span className="font-medium">{formatTime(analysisResults.estimatedTime)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">التكلفة المتوقعة</span>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <span className="font-medium">{analysisResults.estimatedCost} رصيد</span>
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">تحسين الجودة</span>
                                        <div className="flex items-center gap-1">
                                            <Target className="h-4 w-4 text-purple-500" />
                                            <span className="font-medium text-purple-600">+{analysisResults.qualityImprovement}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* شريط تقدم الجودة */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>تحسين الجودة المتوقع</span>
                                        <span className="font-medium">+{analysisResults.qualityImprovement}%</span>
                                    </div>
                                    <Progress value={analysisResults.qualityImprovement} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* معلومات مهمة */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            الوضع المختلط يوفر أفضل توازن بين السرعة والجودة. الأقسام الذكية ستولد بجودة أعلى مع التحسين التكراري، بينما الأقسام التقليدية ستولد بسرعة أكبر.
                        </AlertDescription>
                    </Alert>
                </>
            )}
        </div>
    );
}
