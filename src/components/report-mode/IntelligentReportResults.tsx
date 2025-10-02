/**
 * مكون عرض نتائج التقارير المحسن للنظام الذكي
 * يدعم عرض النتائج من النظام الذكي والتقليدي
 */

'use client';

import type { SectionName } from '@/ai/schemas';
import A4Page from '@/components/shared/A4Page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore } from '@/hooks';
import { AgentCategory } from '@/lib/models/agent';
import { SectionUtils } from '@/services/intelligent-report-service';
import {
    Brain,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    MoreVertical,
    Star,
    Target
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Section } from '../section/SectionView';

interface SectionMetadata {
    qualityScore?: number;
    generationTime?: number;
    iterations?: number;
    modelUsed?: string;
    isIntelligent?: boolean;
    creditCost?: number;
}

interface IntelligentReportResultsProps {
    generatedSections: SectionName[];
    sectionMetadata?: Record<string, SectionMetadata>;
    onRegenerateSection?: (sectionName: SectionName) => void;
    onExportSection?: (sectionName: SectionName) => void;
    onPreviewSection?: (sectionName: SectionName) => void;
    className?: string;
}

export const IntelligentReportResults = ({
    generatedSections,
    sectionMetadata = {},
    onRegenerateSection,
    onExportSection,
    onPreviewSection,
    className
}: IntelligentReportResultsProps) => {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents } = useAgents();
    const [viewMode, setViewMode] = useState<'single' | 'overview'>('single');
    const [currentPage, setCurrentPage] = useState(0);

    const reportAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter(a => a.category === AgentCategory.ReportGeneration);
    }, [agents]);

    const totalPages = generatedSections.length;
    const hasContent = totalPages > 0;
    const currentSectionKey = hasContent ? generatedSections[currentPage] : undefined;

    const getSectionTitle = React.useCallback((sectionKey: SectionName) => {
        return reportAgents?.find(a => a.id.includes(sectionKey))?.name ||
            SectionUtils.getSectionInfo?.(sectionKey)?.title ||
            sectionKey;
    }, [reportAgents]);

    const getSectionMetadata = (sectionName: SectionName): SectionMetadata => {
        return sectionMetadata[sectionName] || {};
    };

    const handleSectionUpdate = (key: SectionName, value: string) => {
        updateProject(p => {
            p.updateSectionContent(key, value);
        });
    };

    React.useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        } else if (totalPages === 0) {
            setCurrentPage(0);
        }
    }, [totalPages, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const formatQualityScore = (score?: number) => {
        if (!score) return null;
        let color = 'bg-gray-500';
        let label = 'غير محدد';

        if (score >= 90) {
            color = 'bg-green-500';
            label = 'ممتاز';
        } else if (score >= 85) {
            color = 'bg-blue-500';
            label = 'جيد جداً';
        } else if (score >= 80) {
            color = 'bg-yellow-500';
            label = 'جيد';
        } else if (score >= 70) {
            color = 'bg-orange-500';
            label = 'مقبول';
        } else {
            color = 'bg-red-500';
            label = 'ضعيف';
        }

        return { color, label, score };
    };

    const renderSectionHeader = (sectionName: SectionName) => {
        const metadata = getSectionMetadata(sectionName);
        const quality = formatQualityScore(metadata.qualityScore);

        return (
            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {metadata.isIntelligent && (
                            <Brain className="h-4 w-4 text-blue-600" />
                        )}
                        <h3 className="font-semibold">{getSectionTitle(sectionName)}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {quality && (
                            <Badge className={`${quality.color} text-white text-xs`}>
                                {quality.score}/100 - {quality.label}
                            </Badge>
                        )}
                        {metadata.isIntelligent && (
                            <Badge variant="outline" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                ذكي
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {metadata.generationTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {SectionUtils.formatEstimatedTime?.(metadata.generationTime) || `${metadata.generationTime}ms`}
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onPreviewSection?.(sectionName)}>
                                <Eye className="h-4 w-4 mr-2" />
                                معاينة
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRegenerateSection?.(sectionName)}>
                                <Edit className="h-4 w-4 mr-2" />
                                إعادة توليد
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExportSection?.(sectionName)}>
                                <Download className="h-4 w-4 mr-2" />
                                تصدير
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    };

    const renderOverview = () => {
        const intelligentSections = generatedSections.filter(s => getSectionMetadata(s).isIntelligent);
        const totalQuality = generatedSections.reduce((sum, s) => {
            const quality = getSectionMetadata(s).qualityScore || 0;
            return sum + quality;
        }, 0);
        const averageQuality = generatedSections.length > 0 ? totalQuality / generatedSections.length : 0;

        return (
            <div className="p-6 space-y-6">
                {/* إحصائيات عامة */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold">{generatedSections.length}</div>
                            <div className="text-sm text-muted-foreground">إجمالي الأقسام</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Brain className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                            <div className="text-2xl font-bold">{intelligentSections.length}</div>
                            <div className="text-sm text-muted-foreground">أقسام ذكية</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold">{averageQuality.toFixed(0)}</div>
                            <div className="text-sm text-muted-foreground">متوسط الجودة</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                            <div className="text-2xl font-bold">
                                {generatedSections.filter(s => (getSectionMetadata(s).qualityScore || 0) >= 90).length}
                            </div>
                            <div className="text-sm text-muted-foreground">أقسام ممتازة</div>
                        </CardContent>
                    </Card>
                </div>

                {/* قائمة الأقسام */}
                <Card>
                    <CardHeader>
                        <CardTitle>الأقسام المولدة</CardTitle>
                        <CardDescription>جميع الأقسام مع معلومات الجودة والأداء</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {generatedSections.map((sectionName, index) => {
                                const metadata = getSectionMetadata(sectionName);
                                const quality = formatQualityScore(metadata.qualityScore);

                                return (
                                    <div key={sectionName} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="font-medium">{getSectionTitle(sectionName)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {metadata.isIntelligent ? 'نظام ذكي' : 'نظام تقليدي'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {quality && (
                                                <Badge className={`${quality.color} text-white text-xs`}>
                                                    {quality.score}/100
                                                </Badge>
                                            )}
                                            {metadata.generationTime && (
                                                <div className="text-xs text-muted-foreground">
                                                    {SectionUtils.formatEstimatedTime?.(metadata.generationTime) || `${metadata.generationTime}ms`}
                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setCurrentPage(index);
                                                    setViewMode('single');
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderSingleView = () => {
        if (!hasContent) {
            return (
                <div className="flex items-center justify-center h-full min-h-[400px] mt-4">
                    <div className="text-center text-muted-foreground p-8">
                        <FileText className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">{t('builder.reportGenerator.emptyStateTitle')}</h3>
                        <p>{t('builder.reportGenerator.emptyStateDesc')}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col">
                {currentSectionKey && renderSectionHeader(currentSectionKey)}
                <div className="flex-1 p-4">
                    <ScrollArea className="h-full">
                        {currentSectionKey && (
                            <A4Page key={currentSectionKey}>
                                <Section
                                    sectionKey={currentSectionKey}
                                    title={getSectionTitle(currentSectionKey)}
                                    content={project?.sections?.[currentSectionKey]!}
                                    onUpdate={handleSectionUpdate}
                                />
                            </A4Page>
                        )}
                    </ScrollArea>
                </div>
            </div>
        );
    };

    return (
        <Card className={`h-full flex flex-col overflow-hidden ${className}`}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
                        <CardDescription>{t('builder.reportGenerator.resultsDesc')}</CardDescription>
                    </div>
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'single' | 'overview')}>
                        <TabsList>
                            <TabsTrigger value="single">عرض فردي</TabsTrigger>
                            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>

            {viewMode === 'single' && totalPages > 1 && (
                <div className="flex w-full justify-center items-center p-2 border-y bg-background">
                    <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {t('builder.presentationGenerator.prev')}
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground mx-4">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
                        {t('builder.presentationGenerator.next')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}

            <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50">
                {viewMode === 'single' ? renderSingleView() : renderOverview()}
            </CardContent>
        </Card>
    );
};
