
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DiagramTypeSchema, SectionName, type DiagramType } from '@/ai/schemas';
import { Loader2, Sparkles, GitGraph, PanelLeftClose } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GuidelineEditor } from '../section/SectionGuidelineEditor';
import { ContextSelector } from '../section/SectionContextSelector';
import { useDiagramGenerationTools } from '@/hooks/use-diagram-generation-tools';
import { SectionAccordionItem } from '../section/SectionAccordionItem';

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
        getIconComponent,
        hasCreditsForGeneration
    } = useDiagramGenerationTools();

    if (!agentsLoaded) {
        return <Card><CardHeader><CardTitle>{t('builder.diagramGenerator.toolsLoading')}</CardTitle><CardContent><Loader2 className="animate-spin" /></CardContent></CardHeader></Card>;
    }

    return (
        <Card className={cn(isAnythingGenerating && 'opacity-50 pointer-events-none')}>
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
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-1">
                    {orderedDiagrams.map((key) => {
                        const diagramConfig = diagramSections[key];
                        if (!diagramConfig) return null;
                        
                        return (
                             <SectionAccordionItem
                                key={key}
                                sectionKey={key as SectionName} // Cast for compatibility
                                onGenerate={() => onGenerateDiagram(key as DiagramType)}
                                isGenerating={false} // Specific logic is handled in useDiagramGenerationTools
                                isAnythingGenerating={isAnythingGenerating}
                                hasCredits={hasCreditsForGeneration}
                            />
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
};
