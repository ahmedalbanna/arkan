'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks';
import { AlertCircle, CheckCircle, FileText, Plus } from 'lucide-react';

interface GuidelinesSummaryProps {
    itemKey: string;
}

export function GuidelinesSummary({ itemKey }: GuidelinesSummaryProps) {
    const { t } = useLocalization();
    const { guidelineState, oneTimeInstructions } = useGenerationUIStore();
    const guidelines = guidelineState[itemKey];
    const oneTimeInstruction = oneTimeInstructions[itemKey];

    if (!guidelines && !oneTimeInstruction) {
        return (
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card variant="glass" className="border-dashed backdrop-blur-md shadow-soft">
                    <CardContent className="p-4">
                        <div className="text-center text-sm text-muted-foreground">
                            {t('builder.reportGenerator.noGuidelinesConfigured')}
                        </div>
                    </CardContent>
                </Card>
            </AnimatedContainer>
        );
    }

    const guidelineItems = [];

    // إضافة التعليمات لمرة واحدة
    if (oneTimeInstruction && oneTimeInstruction.trim() !== '') {
        guidelineItems.push({
            type: 'oneTime',
            icon: AlertCircle,
            label: t('builder.reportGenerator.oneTimeInstructions'),
            value: oneTimeInstruction,
            color: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
        });
    }

    // إضافة الإرشادات المحددة
    if (guidelines) {
        const checkedCount = guidelines.checked.filter(Boolean).length;
        const totalCount = guidelines.checked.length;

        if (checkedCount > 0) {
            guidelineItems.push({
                type: 'default',
                icon: CheckCircle,
                label: t('builder.reportGenerator.defaultGuidelines'),
                value: `${checkedCount}/${totalCount} ${t('builder.reportGenerator.selected')}`,
                color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
            });
        }

        // إضافة الإرشادات المخصصة
        if (guidelines.custom && guidelines.custom.length > 0) {
            guidelineItems.push({
                type: 'custom',
                icon: Plus,
                label: t('builder.reportGenerator.customGuidelines'),
                value: `${guidelines.custom.length} ${t('builder.reportGenerator.added')}`,
                color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
            });
        }
    }

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 font-headline">
                        <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                        {t('builder.reportGenerator.guidelinesSettings')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-3">
                        {guidelineItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <AnimatedContainer key={index} animation="fade-in-up" delay={100 + (index * 100)}>
                                    <div className="space-y-2">
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
                                                {item.value}
                                            </Badge>
                                        </div>
                                        {item.type === 'oneTime' && (
                                            <div className="text-xs text-muted-foreground pl-6 p-2 rounded-lg bg-gradient-to-r from-muted/30 to-primary/5">
                                                &quot;{item.value}&quot;
                                            </div>
                                        )}
                                    </div>
                                </AnimatedContainer>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
}
