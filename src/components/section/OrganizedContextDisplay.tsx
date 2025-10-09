'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { BookMarked, BookOpen, Brain, FileText, Lightbulb, Settings } from 'lucide-react';

interface OrganizedContextDisplayProps {
    organizedContext: any;
    itemKey: string;
}

export function OrganizedContextDisplay({ organizedContext, itemKey }: OrganizedContextDisplayProps) {
    const { t } = useLocalization();

    if (!organizedContext) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-4">
                    <div className="text-center text-sm text-muted-foreground">
                        {t('builder.reportGenerator.noContextOrganized')}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const contextItems = [];

    // الإرشادات والتوجيهات
    if (organizedContext.guidelines.length > 0) {
        contextItems.push({
            type: 'guidelines',
            icon: FileText,
            label: t('builder.reportGenerator.guidelinesAndInstructions'),
            count: organizedContext.guidelines.length,
            color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
            priority: 'critical'
        });
    }

    // المعرفة الأساسية
    if (organizedContext.foundational.length > 0) {
        contextItems.push({
            type: 'foundational',
            icon: BookOpen,
            label: t('builder.reportGenerator.foundationalKnowledge'),
            count: organizedContext.foundational.length,
            color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
            priority: 'high'
        });
    }

    // المعرفة المفاهيمية
    if (organizedContext.conceptual.length > 0) {
        contextItems.push({
            type: 'conceptual',
            icon: Lightbulb,
            label: t('builder.reportGenerator.conceptualKnowledge'),
            count: organizedContext.conceptual.length,
            color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
            priority: 'medium'
        });
    }

    // المعرفة الإجرائية
    if (organizedContext.procedural.length > 0) {
        contextItems.push({
            type: 'procedural',
            icon: Settings,
            label: t('builder.reportGenerator.proceduralKnowledge'),
            count: organizedContext.procedural.length,
            color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
            priority: 'medium'
        });
    }

    // المراجع الإضافية
    if (organizedContext.reference.length > 0) {
        contextItems.push({
            type: 'reference',
            icon: BookMarked,
            label: t('builder.reportGenerator.referenceMaterials'),
            count: organizedContext.reference.length,
            color: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200',
            priority: 'low'
        });
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    {t('builder.reportGenerator.organizedContext')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {contextItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`${item.color} border-0`}
                                >
                                    {item.count}
                                </Badge>
                            </div>
                        );
                    })}

                    {/* إحصائيات السياق */}
                    {organizedContext.statistics && (
                        <div className="pt-3 border-t">
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>إجمالي العناصر: {organizedContext.statistics.totalItems}</div>
                                <div>متوسط الصلة: {organizedContext.statistics.averageRelevance}</div>
                                <div className="col-span-2">
                                    التوزيع: {Object.entries(organizedContext.statistics.byType)
                                        .filter(([_, count]) => count > 0)
                                        .map(([type, count]) => `${type}: ${count}`)
                                        .join(', ')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
