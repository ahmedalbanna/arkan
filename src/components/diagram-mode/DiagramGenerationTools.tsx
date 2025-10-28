
'use client';

import { DiagramTypeSchema } from '@/ai/schemas';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDiagramGenerationTools } from '@/hooks/use-diagram-generation-tools';
import { cn } from '@/lib/utils';
import { PanelLeftClose } from 'lucide-react';
import { SectionAccordionItem } from '../report-mode/SectionAccordionItem';
import { Skeleton } from '../ui/skeleton';

const orderedDiagrams = DiagramTypeSchema.options;

interface DiagramGenerationToolsProps {
    onCollapseToggle: () => void;
}

function ToolsSkeleton() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2 pt-6">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}

export const DiagramGenerationTools = ({ onCollapseToggle }: DiagramGenerationToolsProps) => {
    const {
        t,
        agentsLoaded,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateDiagram,
        diagramSections,
        hasCreditsForGeneration,
    } = useDiagramGenerationTools();

    if (!agentsLoaded || Object.keys(diagramSections).length === 0) {
        return <ToolsSkeleton />;
    }

    return (
        <Card className={cn("flex flex-col h-full", isAnythingGenerating && 'opacity-50 pointer-events-none')}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">{t('builder.diagramGenerator.toolsTitle')}</CardTitle>
                        <CardDescription>{t('builder.diagramGenerator.toolsDesc')}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onCollapseToggle}>
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedDiagrams.map((key) => {
                        const agent = diagramSections[key];
                        if (!agent) return null;

                        const isGeneratingThis = isAnythingGenerating && activeMutationKey === key;
                        return (
                            <SectionAccordionItem
                                key={key}
                                itemKey={key}
                                agent={agent}
                                onGenerate={() => onGenerateDiagram(key)}
                                isGenerating={isGeneratingThis}
                                isAnythingGenerating={isAnythingGenerating}
                                hasCredits={!!hasCreditsForGeneration}
                            />
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
};
