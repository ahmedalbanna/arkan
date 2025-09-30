
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markdownComponents } from '@/lib/markdown-styles';
import ReactMarkdown from 'react-markdown';
// import { useContextSelector } from '@/hooks'; // Not available
import { SectionName } from '@/ai/schemas';

interface ContextViewerProps {
    itemKey: string;
}

export function ContextViewer({ itemKey }: ContextViewerProps) {
    const {
        t,
        proposal,
        projectPlan,
        reportSections,
        diagramSections,
        currentSelection,
        selectedSections,
        selectedDiagrams,
        selectedExternalContext,
        hasContext,
    } = {
        selectedSections: [],
        selectedDiagrams: [],
        selectedExternalContext: [],
        hasContext: false,
        currentSelection: { proposal: false, projectPlan: false },
        projectPlan: null,
        reportSections: {}
    };

    return (
        <ScrollArea className="h-full max-h-[calc(75vh-100px)]">
            <div className="p-1 pr-4">
                <h3 className="font-semibold mb-4">Context used for: {t(reportSections[itemKey as SectionName]?.title || itemKey)}</h3>

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
                    {selectedSections.map(({ key, content }: { key: any; content: any }) => (
                        <AccordionItem value={`section-${key}`} key={`section-${key}`} className="bg-muted/50 rounded-lg border">
                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">{t(reportSections[key].title)}</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    {selectedDiagrams.map(({ key, content }: { key: any; content: any }) => (
                        <AccordionItem value={`diagram-${key}`} key={`diagram-${key}`} className="bg-muted/50 rounded-lg border">
                            <AccordionTrigger className="px-4 py-2 text-sm font-medium">{t(diagramSections[key].title)}</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                <pre><code>{content}</code></pre>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    {selectedExternalContext.map((item: any) => (
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
