
'use client';

import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DiagramTypeSchema } from '@/ai/schemas';
import { Loader2, PanelLeftClose } from 'lucide-react';
import { useDiagramGenerationTools } from '@/hooks/use-diagram-generation-tools';
import { DiagramAccordionItem } from './DiagramAccordionItem';
import { Button } from '@/components/ui/button';

const orderedDiagrams = DiagramTypeSchema.options;

interface DiagramGenerationToolsProps {
    onCollapseToggle: () => void;
}

export const DiagramGenerationTools = ({ onCollapseToggle }: DiagramGenerationToolsProps) => {
    const {
        t,
        agentsLoaded,
        isAnythingGenerating,
        onGenerateDiagram,
        diagramSections,
        hasCreditsForGeneration,
    } = useDiagramGenerationTools();

    if (!agentsLoaded) {
        return <Card><CardHeader><CardTitle>{t('builder.diagramGenerator.toolsLoading')}</CardTitle><CardContent><Loader2 className="animate-spin" /></CardContent></CardHeader></Card>;
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
                        const diagramConfig = diagramSections[key];
                        if (!diagramConfig) return null;
                        
                        return (
                            <DiagramAccordionItem
                                key={key}
                                diagramType={key}
                                onGenerate={onGenerateDiagram}
                                isGenerating={isAnythingGenerating}
                                hasCredits={hasCreditsForGeneration}
                            />
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
};
