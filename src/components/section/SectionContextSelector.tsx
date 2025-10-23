
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useContextSelector } from '@/hooks';
import { ContextFileData } from '@/lib/models/context-manager'; // IMPORT THE TYPE
import { cn } from '@/lib/utils';
import { BookCheck, FileSpreadsheet, FileText, GanttChartSquare, GitGraph } from 'lucide-react';

interface ContextSelectorProps {
    itemKey: string;
}

export function ContextSelector({ itemKey }: ContextSelectorProps) {
    const { t } = useLocalization();

    const {
        proposal,
        projectPlan,
        toggleContextSelection,
        reportSections,
        diagramSections,
        currentSelection,
        generatedSections,
        generatedDiagrams,
        externalContext,
    } = useContextSelector(itemKey);

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <ScrollArea className="h-60 w-full">
                <div className="space-y-4 pr-4">
                    <div className="space-y-2">
                        <Label className="font-semibold font-headline">{t('builder.reportGenerator.ContextualSections')}</Label>

                        {/* Project Proposal */}
                        <AnimatedContainer animation="fade-in-up" delay={300}>
                            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                <Checkbox
                                    id={`context-proposal-${itemKey}`}
                                    checked={currentSelection.proposal}
                                    onCheckedChange={(checked) => toggleContextSelection(itemKey, 'proposal', null, !!checked)}
                                    disabled={!proposal}
                                    className="hover:shadow-soft transition-all duration-200"
                                />
                                <Label htmlFor={`context-proposal-${itemKey}`} className="text-sm font-normal cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                                            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                                        </div>
                                        {t('builder.reportGenerator.projectProposal')}
                                    </div>
                                </Label>
                            </div>
                        </AnimatedContainer>

                        {/* Project Plan */}
                        <AnimatedContainer animation="fade-in-up" delay={400}>
                            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                <Checkbox
                                    id={`context-plan-${itemKey}`}
                                    checked={currentSelection.projectPlan}
                                    onCheckedChange={(checked) => toggleContextSelection(itemKey, 'projectPlan', null, !!checked)}
                                    disabled={!projectPlan}
                                    className="hover:shadow-soft transition-all duration-200"
                                />
                                <Label htmlFor={`context-plan-${itemKey}`} className="text-sm font-normal cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-gradient-to-br from-green-500/10 to-green-600/10">
                                            <GanttChartSquare className="h-4 w-4 text-green-600" />
                                        </div>
                                        {t('builder.reportGenerator.projectPlan')}
                                    </div>
                                </Label>
                            </div>
                        </AnimatedContainer>

                        {/* Generated Sections */}
                        {generatedSections.map((contextKey, index) => (
                            <AnimatedContainer key={`ctx-s-${itemKey}-${contextKey}`} animation="fade-in-up" delay={500 + (index * 100)}>
                                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                    <Checkbox
                                        id={`context-section-${itemKey}-${contextKey}`}
                                        checked={!!currentSelection.sections[contextKey]}
                                        onCheckedChange={(checked) => toggleContextSelection(itemKey, 'sections', contextKey, !!checked)}
                                        className="hover:shadow-soft transition-all duration-200"
                                    />
                                    <Label htmlFor={`context-section-${itemKey}-${contextKey}`} className="text-sm font-normal cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-md bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                                                <BookCheck className="h-4 w-4 text-purple-600" />
                                            </div>
                                            {t(reportSections[contextKey]?.title || contextKey)}
                                        </div>
                                    </Label>
                                </div>
                            </AnimatedContainer>
                        ))}
                        {generatedSections.length === 0 && (
                            <AnimatedContainer animation="fade-in-up" delay={500}>
                                <p className="text-xs text-muted-foreground pl-4">{t('builder.reportGenerator.noOtherSections')}</p>
                            </AnimatedContainer>
                        )}
                    </div>

                    {generatedDiagrams.length > 0 && (
                        <AnimatedContainer animation="fade-in-up" delay={600}>
                            <div className="space-y-2 pt-2 border-t">
                                <Label className="font-semibold font-headline">{t('builder.reportGenerator.context_diagrams')}</Label>
                                {generatedDiagrams.map((contextKey, index) => (
                                    <AnimatedContainer key={`ctx-d-${itemKey}-${contextKey}`} animation="fade-in-up" delay={700 + (index * 100)}>
                                        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                            <Checkbox
                                                id={`context-diagram-${itemKey}-${contextKey}`}
                                                checked={!!currentSelection.diagrams[contextKey]}
                                                onCheckedChange={(checked) => toggleContextSelection(itemKey, 'diagrams', contextKey, !!checked)}
                                                className="hover:shadow-soft transition-all duration-200"
                                            />
                                            <Label htmlFor={`context-diagram-${itemKey}-${contextKey}`} className="text-sm font-normal cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded-md bg-gradient-to-br from-orange-500/10 to-orange-600/10">
                                                        <GitGraph className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    {t(diagramSections[contextKey]?.title || contextKey)}
                                                </div>
                                            </Label>
                                        </div>
                                    </AnimatedContainer>
                                ))}
                            </div>
                        </AnimatedContainer>
                    )}

                    {externalContext && externalContext.length > 0 && (
                        <AnimatedContainer animation="fade-in-up" delay={800}>
                            <div className="space-y-2 pt-2 border-t">
                                <Label className="font-semibold font-headline">{t('builder.reportGenerator.externalContext')}</Label>
                                {/* CORRECTED: Add explicit types for item and index */}
                                {externalContext.map((item: ContextFileData, index: number) => (
                                    <AnimatedContainer key={index} animation="fade-in-up" delay={900 + (index * 100)}>
                                        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-200">
                                            <Checkbox
                                                id={`context-external-${itemKey}-${index}`}
                                                checked={!!currentSelection.externalContext?.[index]}
                                                onCheckedChange={(checked) => toggleContextSelection(itemKey, 'externalContext', index, !!checked)}
                                                className="hover:shadow-soft transition-all duration-200"
                                            />
                                            <Label htmlFor={`context-external-${itemKey}-${index}`} className="text-sm font-normal cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded-md bg-gradient-to-br from-gray-500/10 to-gray-600/10">
                                                        <FileText className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <span className="truncate">{item.fileName}</span>
                                                    <Badge variant="secondary" className={cn("text-xs capitalize shadow-soft", {
                                                        'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800': item.type === 'context',
                                                        'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800': item.type === 'example',
                                                        'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800': item.type === 'question',
                                                        'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800': item.type === 'textbook',
                                                        'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600': item.type === 'guidelines',
                                                    })}>{item.type}</Badge>
                                                </div>
                                            </Label>
                                        </div>
                                    </AnimatedContainer>
                                ))}
                            </div>
                        </AnimatedContainer>
                    )}
                </div>
            </ScrollArea>
        </AnimatedContainer>
    );
}
