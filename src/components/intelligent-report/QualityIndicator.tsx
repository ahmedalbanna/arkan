/**
 * مكون مؤشرات الجودة والأداء للتقارير المولدة
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CompleteReportResult, SingleSectionResult } from '@/services/intelligent-report-service';
import { SectionUtils } from '@/services/intelligent-report-service';
import {
    AlertTriangle,
    Award,
    BarChart3,
    CheckCircle,
    Download,
    Eye,
    Info,
    Star,
    Target,
    TrendingUp
} from 'lucide-react';

interface QualityIndicatorProps {
    result: SingleSectionResult | CompleteReportResult;
    mode: 'single' | 'complete';
    qualityAnalysis?: {
        overallGrade: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';
        qualityInsights: {
            highQualitySections: string[];
            lowQualitySections: string[];
            averageIterations: number;
            totalGenerationTime: number;
            recommendations: string[];
        };
    };
    onPreview?: () => void;
    onDownload?: () => void;
    className?: string;
}

export function QualityIndicator({
    result,
    mode,
    qualityAnalysis,
    onPreview,
    onDownload,
    className
}: QualityIndicatorProps) {

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'ممتاز': return 'text-green-600 bg-green-100 dark:bg-green-900';
            case 'جيد جداً': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
            case 'جيد': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
            case 'مقبول': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
            case 'ضعيف': return 'text-red-600 bg-red-100 dark:bg-red-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
        }
    };

    const getGradeIcon = (grade: string) => {
        switch (grade) {
            case 'ممتاز': return <Award className="h-4 w-4" />;
            case 'جيد جداً': return <Star className="h-4 w-4" />;
            case 'جيد': return <CheckCircle className="h-4 w-4" />;
            case 'مقبول': return <Target className="h-4 w-4" />;
            case 'ضعيف': return <AlertTriangle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        const seconds = Math.round(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.round(seconds / 60);
        return `${minutes}m`;
    };

    const getQualityColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 85) return 'text-blue-600';
        if (score >= 80) return 'text-yellow-600';
        if (score >= 70) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {mode === 'single' && 'singleSection' in result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>تم توليد القسم بنجاح</span>
                            </div>
                            <Badge variant="default" className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                جودة عالية
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* إحصائيات القسم */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="text-lg font-semibold text-green-600">85+</div>
                                <div className="text-sm text-muted-foreground">نقاط الجودة</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="text-lg font-semibold text-blue-600">
                                    {formatTime(result.metadata?.executionTime || 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">وقت التوليد</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="text-lg font-semibold text-purple-600">
                                    {result.metadata?.creditCost || 1}
                                </div>
                                <div className="text-sm text-muted-foreground">رصيد مستهلك</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="text-lg font-semibold text-orange-600">ذكي</div>
                                <div className="text-sm text-muted-foreground">نوع التوليد</div>
                            </div>
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex items-center gap-2">
                            {onPreview && (
                                <Button variant="outline" size="sm" onClick={onPreview} className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    معاينة
                                </Button>
                            )}
                            {onDownload && (
                                <Button variant="outline" size="sm" onClick={onDownload} className="flex items-center gap-1">
                                    <Download className="h-4 w-4" />
                                    تحميل
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {mode === 'complete' && 'completeReport' in result && (
                <div className="space-y-4">
                    {/* نظرة عامة على التقرير */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-green-500" />
                                    <span>تقرير كامل مولد</span>
                                </div>
                                {qualityAnalysis && (
                                    <Badge className={`flex items-center gap-1 ${getGradeColor(qualityAnalysis.overallGrade)}`}>
                                        {getGradeIcon(qualityAnalysis.overallGrade)}
                                        {qualityAnalysis.overallGrade}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* إحصائيات عامة */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                                    <div className="text-lg font-semibold text-green-600">
                                        {result.overallMetrics.successfulSections}
                                    </div>
                                    <div className="text-sm text-muted-foreground">أقسام مكتملة</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                    <div className={`text-lg font-semibold ${getQualityColor(result.overallMetrics.averageQuality)}`}>
                                        {result.overallMetrics.averageQuality.toFixed(1)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">متوسط الجودة</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                                    <div className="text-lg font-semibold text-purple-600">
                                        {formatTime(result.overallMetrics.totalTime)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">إجمالي الوقت</div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                                    <div className="text-lg font-semibold text-orange-600">
                                        {result.metadata?.creditCost || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">رصيد مستهلك</div>
                                </div>
                            </div>

                            {/* شريط تقدم الجودة */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>جودة التقرير الإجمالية</span>
                                    <span className={getQualityColor(result.overallMetrics.averageQuality)}>
                                        {result.overallMetrics.averageQuality.toFixed(1)}/100
                                    </span>
                                </div>
                                <Progress
                                    value={result.overallMetrics.averageQuality}
                                    className="h-2"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* تفاصيل الأقسام */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                تفاصيل الأقسام
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(result.sectionMetadata).map(([section, metadata]) => {
                                    const qualityFormatted = SectionUtils.formatQualityScore(metadata.qualityScore);

                                    return (
                                        <div
                                            key={section}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {section}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatTime(metadata.generationTime)} - {metadata.iterations} تكرار - {metadata.modelUsed}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${qualityFormatted.color === 'green' ? 'text-green-600 border-green-600' :
                                                        qualityFormatted.color === 'blue' ? 'text-blue-600 border-blue-600' :
                                                            qualityFormatted.color === 'yellow' ? 'text-yellow-600 border-yellow-600' :
                                                                qualityFormatted.color === 'orange' ? 'text-orange-600 border-orange-600' :
                                                                    'text-red-600 border-red-600'
                                                        }`}
                                                >
                                                    {qualityFormatted.score}/100
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    {qualityFormatted.grade}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* تحليل الجودة والتوصيات */}
                    {qualityAnalysis && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    تحليل الجودة والتوصيات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* الأقسام عالية الجودة */}
                                {qualityAnalysis.qualityInsights.highQualitySections.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="h-4 w-4 text-green-500" />
                                            <span className="font-medium text-sm">أقسام متميزة</span>
                                        </div>
                                        <div className="flex gap-1 flex-wrap">
                                            {qualityAnalysis.qualityInsights.highQualitySections.map(section => (
                                                <Badge key={section} variant="default" className="text-xs">
                                                    {section}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* الأقسام التي تحتاج تحسين */}
                                {qualityAnalysis.qualityInsights.lowQualitySections.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            <span className="font-medium text-sm">أقسام تحتاج تحسين</span>
                                        </div>
                                        <div className="flex gap-1 flex-wrap">
                                            {qualityAnalysis.qualityInsights.lowQualitySections.map(section => (
                                                <Badge key={section} variant="destructive" className="text-xs">
                                                    {section}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* التوصيات */}
                                {qualityAnalysis.qualityInsights.recommendations.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium text-sm">توصيات للتحسين</span>
                                        </div>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            {qualityAnalysis.qualityInsights.recommendations.map((rec, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* إحصائيات إضافية */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-600">
                                            {qualityAnalysis.qualityInsights.averageIterations.toFixed(1)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">متوسط التكرارات</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-purple-600">
                                            {formatTime(qualityAnalysis.qualityInsights.totalGenerationTime)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">إجمالي وقت التوليد</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* أزرار الإجراءات */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-center gap-2">
                                {onPreview && (
                                    <Button variant="outline" onClick={onPreview} className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        معاينة التقرير
                                    </Button>
                                )}
                                {onDownload && (
                                    <Button onClick={onDownload} className="flex items-center gap-1">
                                        <Download className="h-4 w-4" />
                                        تحميل التقرير
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
