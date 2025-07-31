
'use client';

import React from 'react';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import { type SectionName, type DiagramType, DiagramTypeSchema } from '@/ai/schemas';
import { FileSpreadsheet, GanttChartSquare, BookCheck, GitGraph, FileText } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Badge } from '../ui/badge';
import { cn } from '../utils';

const orderedSections = Object.keys(sectionConfig) as SectionName[];
const orderedDiagrams = DiagramTypeSchema.options;

interface ContextSelectorProps {
    itemKey: string;
}

const defaultSelection = { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

export function ContextSelector({ itemKey }: ContextSelectorProps) {
    const { t } = useLocalization();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();
    const { sections, externalContext, toggleContextSelection, contextSelection } = useReportStore();
    const { diagrams } = useDiagramStore();

    const currentSelection = contextSelection[itemKey] || defaultSelection;

    return (
        <ScrollArea className="h-60 w-full">
            <div className="space-y-4 pr-4">
                <div className="space-y-2">
                    <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>
                    <div className="flex items-center space-x-2">
                        <Checkbox id={`context-proposal-${itemKey}`} checked={!!currentSelection.proposal} onCheckedChange={(checked) => toggleContextSelection(itemKey, 'proposal', null, !!checked)} disabled={!proposal} />
                        <Label htmlFor={`context-proposal-${itemKey}`} className="text-sm font-normal"><div className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Project Proposal</div></Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id={`context-plan-${itemKey}`} checked={!!currentSelection.projectPlan} onCheckedChange={(checked) => toggleContextSelection(itemKey, 'projectPlan', null, !!checked)} disabled={!projectPlan} />
                        <Label htmlFor={`context-plan-${itemKey}`} className="text-sm font-normal"><div className="flex items-center gap-2"><GanttChartSquare className="h-4 w-4" /> Project Plan</div></Label>
                    </div>
                    {orderedSections.filter(sKey => sections[sKey]).map(contextKey => (
                        <div key={`ctx-s-${itemKey}-${contextKey}`} className="flex items-center space-x-2">
                            <Checkbox
                                id={`context-section-${itemKey}-${contextKey}`}
                                checked={!!currentSelection.sections[contextKey]}
                                onCheckedChange={(checked) => toggleContextSelection(itemKey, 'sections', contextKey, !!checked)}
                            />
                            <Label htmlFor={`context-section-${itemKey}-${contextKey}`} className="text-sm font-normal">
                                <div className="flex items-center gap-2">
                                    <BookCheck className="h-4 w-4" />
                                    {t(sectionConfig[contextKey].title)}
                                </div>
                            </Label>
                        </div>
                    ))}
                    {Object.keys(sections).length === 0 && (
                        <p className="text-xs text-muted-foreground">{t('builder.reportGenerator.noOtherSections')}</p>
                    )}
                </div>

                {Object.keys(diagrams || {}).length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <Label className="font-semibold">{t('builder.reportGenerator.context_diagrams')}</Label>
                        {orderedDiagrams.filter(dKey => diagrams?.[dKey]).map(contextKey => (
                            <div key={`ctx-d-${itemKey}-${contextKey}`} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`context-diagram-${itemKey}-${contextKey}`}
                                    checked={!!currentSelection.diagrams[contextKey]}
                                    onCheckedChange={(checked) => toggleContextSelection(itemKey, 'diagrams', contextKey, !!checked)}
                                />
                                <Label htmlFor={`context-diagram-${itemKey}-${contextKey}`} className="text-sm font-normal">
                                    <div className="flex items-center gap-2">
                                        <GitGraph className="h-4 w-4" />
                                        {t(diagramConfig[contextKey].title)}
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
                                                    'bg-blue-100 text-blue-800 border-blue-200': item.type === 'context',
                                                    'bg-green-100 text-green-800 border-green-200': item.type === 'example',
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200': item.type === 'question',
                                                    'bg-purple-100 text-purple-800 border-purple-200': item.type === 'textbook',
                                                    'bg-gray-100 text-gray-800 border-gray-200': item.type === 'guidelines',
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
