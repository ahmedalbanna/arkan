

'use client';

import React from 'react';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSectionStore } from '@/hooks/useSectionStore';
import { type SectionName, type DiagramType, DiagramTypeSchema } from '@/ai/schemas';
import { FileSpreadsheet, GanttChartSquare, BookCheck, GitGraph, FileText } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';



interface ContextSelectorProps {
    itemKey: string;
}

const emptySelection = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: false };

export function ContextSelector({ itemKey }: ContextSelectorProps) {
    const { t } = useLocalization();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();
    const { sections, externalContext, toggleContextSelection, contextSelection } = useReportStore();
    const { diagrams } = useDiagramStore();
    const { reportSections, diagramSections } = useSectionStore();
    const orderedSections = Object.keys(reportSections).sort() as SectionName[]; // Add .sort() if order is important
    const orderedDiagrams = DiagramTypeSchema.options;

    const currentSelection = contextSelection[itemKey] || emptySelection;

    const generatedSections = orderedSections.filter(key => sections[key]);
    const generatedDiagrams = orderedDiagrams.filter(key => diagrams[key]);

    return (
        <ScrollArea className="h-60 w-full">
            <div className="space-y-4 pr-4">
                <div className="space-y-2">
                    <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>

                    {/* Project Proposal */}
                    <div className="flex items-center space-x-2">
                        <Checkbox id={`context-proposal-${itemKey}`} checked={!!currentSelection.proposal} onCheckedChange={(checked) => toggleContextSelection(itemKey, 'proposal', null, !!checked)} disabled={!proposal} />
                        <Label htmlFor={`context-proposal-${itemKey}`} className="text-sm font-normal"><div className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Project Proposal</div></Label>
                    </div>

                    {/* Project Plan */}
                    <div className="flex items-center space-x-2">
                        <Checkbox id={`context-plan-${itemKey}`} checked={!!currentSelection.projectPlan} onCheckedChange={(checked) => toggleContextSelection(itemKey, 'projectPlan', null, !!checked)} disabled={!projectPlan} />
                        <Label htmlFor={`context-plan-${itemKey}`} className="text-sm font-normal"><div className="flex items-center gap-2"><GanttChartSquare className="h-4 w-4" /> Project Plan</div></Label>
                    </div>

                    {/* Generated Sections */}
                    {generatedSections.map(contextKey => (
                        <div key={`ctx-s-${itemKey}-${contextKey}`} className="flex items-center space-x-2">
                            <Checkbox
                                id={`context-section-${itemKey}-${contextKey}`}
                                checked={!!currentSelection.sections[contextKey]}
                                onCheckedChange={(checked) => toggleContextSelection(itemKey, 'sections', contextKey, !!checked)}
                            />
                            <Label htmlFor={`context-section-${itemKey}-${contextKey}`} className="text-sm font-normal">
                                <div className="flex items-center gap-2">
                                    <BookCheck className="h-4 w-4" />
                                    {t(reportSections[contextKey]?.title || contextKey)}
                                </div>
                            </Label>
                        </div>
                    ))}
                    {generatedSections.length === 0 && (
                        <p className="text-xs text-muted-foreground pl-4">{t('builder.reportGenerator.noOtherSections')}</p>
                    )}
                </div>

                {generatedDiagrams.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <Label className="font-semibold">{t('builder.reportGenerator.context_diagrams')}</Label>
                        {generatedDiagrams.map(contextKey => (
                            <div key={`ctx-d-${itemKey}-${contextKey}`} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`context-diagram-${itemKey}-${contextKey}`}
                                    checked={!!currentSelection.diagrams[contextKey]}
                                    onCheckedChange={(checked) => toggleContextSelection(itemKey, 'diagrams', contextKey, !!checked)}
                                />
                                <Label htmlFor={`context-diagram-${itemKey}-${contextKey}`} className="text-sm font-normal">
                                    <div className="flex items-center gap-2">
                                        <GitGraph className="h-4 w-4" />
                                        {t(diagramSections[contextKey]?.title || contextKey)}
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                )}

                {externalContext && externalContext.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <Label className="font-semibold">{t('builder.reportGenerator.externalContext')}</Label>
                        {externalContext.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`context-external-${itemKey}-${index}`}
                                    checked={!!currentSelection.externalContext?.[index]}
                                    onCheckedChange={(checked) => toggleContextSelection(itemKey, 'externalContext', index, !!checked)}
                                />
                                <Label htmlFor={`context-external-${itemKey}-${index}`} className="text-sm font-normal">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="truncate">{item.fileName}</span>
                                        <Badge variant="secondary" className={cn("text-xs capitalize", {
                                                    'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800': item.type === 'context',
                                                    'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800': item.type === 'example',
                                                    'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800': item.type === 'question',
                                                    'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800': item.type === 'textbook',
                                                    'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600': item.type === 'guidelines',
                                                })}>{item.type}</Badge>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
