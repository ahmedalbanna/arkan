'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useContextSelector } from '@/hooks';
import { BookCheck, FileSpreadsheet, FileText, GanttChartSquare, GitGraph } from 'lucide-react';

interface ContextSummaryProps {
    itemKey: string;
}

export function ContextSummary({ itemKey }: ContextSummaryProps) {
    const { t } = useLocalization();
    const {
        currentSelection,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
    } = useContextSelector(itemKey);

    if (!hasContext) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-4">
                    <div className="text-center text-sm text-muted-foreground">
                        {t('builder.reportGenerator.noContextSelected')}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const contextItems = [];

    // إضافة عرض المشروع
    if (currentSelection.proposal) {
        contextItems.push({
            type: 'proposal',
            icon: FileSpreadsheet,
            label: t('builder.reportGenerator.projectProposal'),
            color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
        });
    }

    // إضافة خطة المشروع
    if (currentSelection.projectPlan) {
        contextItems.push({
            type: 'plan',
            icon: GanttChartSquare,
            label: t('builder.reportGenerator.projectPlan'),
            color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
        });
    }

    // إضافة الأقسام المحددة
    selectedSections.forEach(({ key }) => {
        contextItems.push({
            type: 'section',
            icon: BookCheck,
            label: key,
            color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
        });
    });

    // إضافة الرسوم البيانية المحددة
    selectedDiagrams.forEach(({ key }) => {
        contextItems.push({
            type: 'diagram',
            icon: GitGraph,
            label: key,
            color: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
        });
    });

    // إضافة السياق الخارجي المحدد
    selectedExternalContext.forEach((item: any) => {
        contextItems.push({
            type: 'external',
            icon: FileText,
            label: item.fileName,
            color: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200'
        });
    });

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                    {t('builder.reportGenerator.selectedContext')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                    {contextItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Badge
                                key={index}
                                variant="secondary"
                                className={`${item.color} border-0`}
                            >
                                <Icon className="h-3 w-3 mr-1" />
                                {item.label}
                            </Badge>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
