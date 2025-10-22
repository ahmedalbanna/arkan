'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { BookMarked, BookOpen, Brain, FileText, Lightbulb, Settings } from 'lucide-react';

interface ContextItem {
    type: string;
    icon: React.ElementType;
    label: string;
    count: number;
    color: string;
    priority: string;
}

interface OrganizedContext {
    guidelines: any[];
    foundational: any[];
    conceptual: any[];
    procedural: any[];
    reference: any[];
    statistics?: {
        totalItems: number;
        averageRelevance: number;
        byType: Record<string, number>;
    };
}

interface OrganizedContextDisplayProps {
    organizedContext: OrganizedContext | null;
    itemKey: string;
}

export function OrganizedContextDisplay({ organizedContext, itemKey }: OrganizedContextDisplayProps) {
    const { t } = useLocalization();

    if (!organizedContext) {
        return (
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="border-dashed backdrop-blur-md shadow-soft">
                    <CardContent className="p-4">
                        <div className="text-center text-sm text-muted-foreground">
                            {t('builder.reportGenerator.noContextOrganized')}
                        </div>
                    </CardContent>
                </Card>
            </AnimatedContainer>
        );
    }

    const contextItems: ContextItem[] = [];

    if (organizedContext.guidelines?.length > 0) {
        contextItems.push({
            type: 'guidelines',
            icon: FileText,
            label: t('builder.reportGenerator.guidelinesAndInstructions'),
            count: organizedContext.guidelines.length,
            color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
            priority: 'critical'
        });
    }

    if (organizedContext.foundational?.length > 0) {
        contextItems.push({
            type: 'foundational',
            icon: BookOpen,
            label: t('builder.reportGenerator.foundationalKnowledge'),
            count: organizedContext.foundational.length,
            color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
            priority: 'high'
        });
    }

    if (organizedContext.conceptual?.length > 0) {
        contextItems.push({
            type: 'conceptual',
            icon: Lightbulb,
            label: t('builder.reportGenerator.conceptualKnowledge'),
            count: organizedContext.conceptual.length,
            color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
            priority: 'medium'
        });
    }

    if (organizedContext.procedural?.length > 0) {
        contextItems.push({
            type: 'procedural',
            icon: Settings,
            label: t('builder.reportGenerator.proceduralKnowledge'),
            count: organizedContext.procedural.length,
            color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
            priority: 'medium'
        });
    }

    if (organizedContext.reference?.length > 0) {
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
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 font-headline">
                        <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                            <Brain className="h-4 w-4 text-white" />
                        </div>
                        {t('builder.reportGenerator.organizedContext')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-3">
                        {contextItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <AnimatedContainer key={index} animation="fade-in-up" delay={100 + (index * 100)}>
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-md bg-gradient-to-br from-muted to-muted/80">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={`${item.color} border-0 shadow-soft`}
                                        >
                                            {item.count}
                                        </Badge>
                                    </div>
                                </AnimatedContainer>
                            );
                        })}

                        {organizedContext.statistics && (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <div className="pt-3 border-t">
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        <div>إجمالي العناصر: {organizedContext.statistics.totalItems}</div>
                                        <div>متوسط الصلة: {organizedContext.statistics.averageRelevance.toFixed(2)}</div>
                                        <div className="col-span-2">
                                            التوزيع: {Object.entries(organizedContext.statistics.byType)
                                                .filter(([_, count]) => (count as number) > 0)
                                                .map(([type, count]) => `${type}: ${count as number}`)
                                                .join(', ')}
                                        </div>
                                    </div>
                                </div>
                            </AnimatedContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
}
