/**
 * لوحة إعدادات التقرير الذكي
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SectionUtils } from '@/services/intelligent-report-service';
import {
    Brain,
    Clock,
    FileText,
    Settings,
    Target,
    TrendingUp,
    Upload,
    Zap
} from 'lucide-react';

interface ReportConfigPanelProps {
    config: {
        proposal: any;
        projectPlan: any;
        guidelines: string[];
        contextFiles: Array<{ fileName: string; content: string; type: string }>;
        qualityThreshold: number;
        enableIterativeImprovement: boolean;
        enablePerformanceMonitoring: boolean;
    };
    onConfigChange: (updates: Partial<typeof config>) => void;
    estimates?: {
        totalEstimatedTime: number;
        sectionEstimates: Record<string, number>;
        averageQualityThreshold: number;
    };
    estimatedCost?: number;
    className?: string;
}

export function ReportConfigPanel({
    config,
    onConfigChange,
    estimates,
    estimatedCost,
    className
}: ReportConfigPanelProps) {

    const handleGuidelinesChange = (value: string) => {
        const guidelines = value.split('\n').filter(line => line.trim());
        onConfigChange({ guidelines });
    };

    const getQualityLabel = (threshold: number) => {
        if (threshold >= 90) return 'ممتاز';
        if (threshold >= 85) return 'جيد جداً';
        if (threshold >= 80) return 'جيد';
        if (threshold >= 75) return 'مقبول';
        return 'أساسي';
    };

    const getQualityColor = (threshold: number) => {
        if (threshold >= 90) return 'text-green-600';
        if (threshold >= 85) return 'text-blue-600';
        if (threshold >= 80) return 'text-yellow-600';
        if (threshold >= 75) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* إعدادات الجودة */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        إعدادات الجودة
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* عتبة الجودة */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">عتبة الجودة</Label>
                            <Badge
                                variant="outline"
                                className={getQualityColor(config.qualityThreshold)}
                            >
                                {config.qualityThreshold}/100 - {getQualityLabel(config.qualityThreshold)}
                            </Badge>
                        </div>
                        <Slider
                            value={[config.qualityThreshold]}
                            onValueChange={([value]) => onConfigChange({ qualityThreshold: value })}
                            min={70}
                            max={100}
                            step={5}
                            className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">
                            جودة أعلى = وقت أطول ولكن نتائج أفضل
                        </div>
                    </div>

                    {/* التحسين التكراري */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">التحسين التكراري</Label>
                            <div className="text-xs text-muted-foreground">
                                تحسين المحتوى تلقائياً للوصول لأفضل جودة
                            </div>
                        </div>
                        <Switch
                            checked={config.enableIterativeImprovement}
                            onCheckedChange={(checked) => onConfigChange({ enableIterativeImprovement: checked })}
                        />
                    </div>

                    {/* مراقبة الأداء */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">مراقبة الأداء</Label>
                            <div className="text-xs text-muted-foreground">
                                تتبع مفصل لأداء وجودة التوليد
                            </div>
                        </div>
                        <Switch
                            checked={config.enablePerformanceMonitoring}
                            onCheckedChange={(checked) => onConfigChange({ enablePerformanceMonitoring: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* التوجيهات */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        التوجيهات والإرشادات
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            توجيهات مخصصة ({config.guidelines.length})
                        </Label>
                        <Textarea
                            placeholder="أدخل التوجيهات، كل توجيه في سطر منفصل..."
                            value={config.guidelines.join('\n')}
                            onChange={(e) => handleGuidelinesChange(e.target.value)}
                            rows={4}
                            className="text-sm"
                        />
                        <div className="text-xs text-muted-foreground">
                            مثال: "استخدم لغة أكاديمية مهنية" أو "ركز على الفوائد العملية"
                        </div>
                    </div>

                    {/* ملفات السياق */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                                ملفات السياق ({config.contextFiles.length})
                            </Label>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Upload className="h-3 w-3" />
                                إضافة ملف
                            </Button>
                        </div>
                        {config.contextFiles.length > 0 && (
                            <div className="space-y-1">
                                {config.contextFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs">
                                        <span className="truncate">{file.fileName}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {file.type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* التقديرات */}
            {estimates && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5" />
                            التقديرات
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {SectionUtils.formatEstimatedTime(estimates.totalEstimatedTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">وقت متوقع</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Zap className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="text-lg font-semibold text-green-600">
                                    {estimatedCost || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">رصيد متوقع</div>
                            </div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Target className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="text-lg font-semibold text-purple-600">
                                {estimates.averageQualityThreshold.toFixed(0)}/100
                            </div>
                            <div className="text-xs text-muted-foreground">متوسط عتبة الجودة</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ميزات النظام الذكي */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Brain className="h-5 w-5" />
                        ميزات النظام الذكي
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">تحليل السياق الذكي</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">اختيار النموذج التكيفي</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">بناء Prompts ذكي</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">تقييم الجودة التلقائي</span>
                        </div>
                        {config.enableIterativeImprovement && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">التحسين التكراري</span>
                            </div>
                        )}
                        {config.enablePerformanceMonitoring && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm">مراقبة الأداء المتقدمة</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* نصائح للحصول على أفضل النتائج */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-900 dark:text-blue-100">
                        <Settings className="h-5 w-5" />
                        نصائح للحصول على أفضل النتائج
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>استخدم عتبة جودة 85+ للمشاريع المهمة</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>أضف توجيهات واضحة ومحددة</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>ارفع ملفات السياق ذات الصلة</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>فعّل التحسين التكراري للجودة العالية</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
