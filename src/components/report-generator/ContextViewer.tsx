
'use client';

import React from 'react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { useReportStore } from '@/hooks/useReportStore';
import { diagramConfig, sectionConfig } from '@/lib/sections-config';
import { DiagramType, SectionName } from '@/ai/schemas';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useLocalization } from '@/context/LocalizationContext';

interface ContextViewerProps {
    itemKey: string;
}

export function ContextViewer({ itemKey }: ContextViewerProps) {
    const { t } = useLocalization();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();
    const { sections, externalContext, contextSelection } = useReportStore();
    const { diagrams } = useDiagramStore();

    const currentSelection = contextSelection[itemKey] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

    const selectedSections = Object.keys(currentSelection.sections)
        .filter(key => currentSelection.sections[key] && sections[key as SectionName])
        .map(key => ({ key: key as SectionName, content: sections[key as SectionName]! }));

    const selectedDiagrams = Object.keys(currentSelection.diagrams)
        .filter(key => currentSelection.diagrams[key] && diagrams[key as DiagramType])
        .map(key => ({ key: key as DiagramType, content: diagrams[key as DiagramType]!.plantUmlCode }));

    const selectedExternalContext = (externalContext || [])
        .map((item, index) => ({ ...item, index }))
        .filter(item => currentSelection.externalContext[item.index]);

    const hasContext = currentSelection.proposal || currentSelection.projectPlan || selectedSections.length > 0 || selectedDiagrams.length > 0 || selectedExternalContext.length > 0;

    return (
        <ScrollArea className="h-full max-h-[calc(75vh-100px)]">
            <div className="p-1 pr-4">
                <h3 className="font-semibold mb-4">Context used for: {t(sectionConfig[itemKey as SectionName]?.title || itemKey)}</h3>
                
                {!hasContext && <p className="text-sm text-muted-foreground">No context selected for this section.</p>}

                <Accordion type="multiple" className="w-full space-y-2">
                    {currentSelection.proposal && proposal && (
                        <AccordionItem value="proposal" className="bg-muted/50 rounded-lg border">
                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">Project Proposal</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                <ReactMarkdown components={markdownComponents}>{String(proposal.objective)}</ReactMarkdown>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    {currentSelection.projectPlan && projectPlan && (
                         <AccordionItem value="plan" className="bg-muted/50 rounded-lg border">
                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">Project Plan</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                Project plan details would be summarized here.
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    {selectedSections.map(({ key, content }) => (
                         <AccordionItem value={`section-${key}`} key={`section-${key}`} className="bg-muted/50 rounded-lg border">
                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">{t(sectionConfig[key].title)}</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                     {selectedDiagrams.map(({ key, content }) => (
                         <AccordionItem value={`diagram-${key}`} key={`diagram-${key}`} className="bg-muted/50 rounded-lg border">
                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">{t(diagramConfig[key].title)}</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                <pre><code>{content}</code></pre>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                     {selectedExternalContext.map((item) => (
                         <AccordionItem value={`external-${item.index}`} key={`external-${item.index}`} className="bg-muted/50 rounded-lg border">
                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">{item.fileName}</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </ScrollArea>
    );
}
