
'use client';

import { SectionName } from '@/ai/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedContainer } from '@/components/ui/animation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContextSelector } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import ReactMarkdown from 'react-markdown';

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
    } = useContextSelector(itemKey);

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <ScrollArea className="h-full max-h-[calc(75vh-100px)]">
                <div className="p-1 pr-4">
                    <h3 className="font-semibold mb-4 font-headline">Context used for: {t(reportSections[itemKey as SectionName]?.title || itemKey)}</h3>

                    {!hasContext && <p className="text-sm text-muted-foreground">No context selected for this section.</p>}

                    <Accordion type="multiple" className="w-full space-y-2">
                        {currentSelection.proposal && proposal && (
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <AccordionItem value="proposal" className="bg-gradient-to-r from-muted/50 to-primary/5 rounded-lg border hover:shadow-soft transition-all duration-200">
                                    <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">Project Proposal</AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                        <ReactMarkdown components={markdownComponents}>{String(proposal.objective)}</ReactMarkdown>
                                    </AccordionContent>
                                </AccordionItem>
                            </AnimatedContainer>
                        )}
                        {currentSelection.projectPlan && projectPlan && (
                            <AnimatedContainer animation="fade-in-up" delay={400}>
                                <AccordionItem value="plan" className="bg-gradient-to-r from-muted/50 to-primary/5 rounded-lg border hover:shadow-soft transition-all duration-200">
                                    <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">Project Plan</AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                        Project plan details would be summarized here.
                                    </AccordionContent>
                                </AccordionItem>
                            </AnimatedContainer>
                        )}
                        {selectedSections.map(({ key, content }: { key: any; content: any }, index) => (
                            <AnimatedContainer key={`section-${key}`} animation="fade-in-up" delay={500 + (index * 100)}>
                                <AccordionItem value={`section-${key}`} className="bg-gradient-to-r from-muted/50 to-primary/5 rounded-lg border hover:shadow-soft transition-all duration-200">
                                    <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">{t(reportSections[key].title)}</AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                                    </AccordionContent>
                                </AccordionItem>
                            </AnimatedContainer>
                        ))}
                        {selectedDiagrams.map(({ key, content }: { key: any; content: any }, index) => (
                            <AnimatedContainer key={`diagram-${key}`} animation="fade-in-up" delay={600 + (index * 100)}>
                                <AccordionItem value={`diagram-${key}`} className="bg-gradient-to-r from-muted/50 to-primary/5 rounded-lg border hover:shadow-soft transition-all duration-200">
                                    <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">{t(diagramSections[key].title)}</AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                        <pre><code>{content}</code></pre>
                                    </AccordionContent>
                                </AccordionItem>
                            </AnimatedContainer>
                        ))}
                        {selectedExternalContext.map((item: any, index) => (
                            <AnimatedContainer key={`external-${item.index}`} animation="fade-in-up" delay={700 + (index * 100)}>
                                <AccordionItem value={`external-${item.index}`} className="bg-gradient-to-r from-muted/50 to-primary/5 rounded-lg border hover:shadow-soft transition-all duration-200">
                                    <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">{item.fileName}</AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0 text-xs text-muted-foreground prose dark:prose-invert max-w-none">
                                        <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>
                                    </AccordionContent>
                                </AccordionItem>
                            </AnimatedContainer>
                        ))}
                    </Accordion>
                </div>
            </ScrollArea>
        </AnimatedContainer>
    );
}
