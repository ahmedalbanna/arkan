

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import DiagramViewer from './DiagramViewer';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { diagramConfig } from '@/lib/sections-config';
import { GitGraph, AlertCircle, Loader2, PanelRightOpen, PanelLeftClose } from 'lucide-react';
import { DiagramGenerationTools } from './DiagramGenerationTools';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion } from '@/components/ui/accordion';
import { AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import type { DiagramType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useUpdateDiagram } from '@/hooks/use-diagrams';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

function DiagramSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export default function DiagramGenerator() {
    const { t, locale } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const {
        diagrams,
        handleDiagramCodeUpdate,
        setDiagram,
        setDiagramExplanation,
    } = useDiagramStore();

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        // Find which diagram this mutation was for to update the correct one
        const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => diagrams[key]?.plantUmlCode === plantUmlCode);
        if(diagramKey) {
            setDiagram(diagramKey, { ...diagrams[diagramKey]!, plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
        }
    });

    const handleUpdateDiagram = (plantUmlCode: string) => {
        mutation.mutate(plantUmlCode);
    };

    const generatedDiagrams = orderedDiagrams.filter(key => diagrams?.[key]);

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            {isPanelCollapsed && (
                <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
                     <Button
                        variant="secondary"
                        className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                        onClick={() => setIsPanelCollapsed(false)}
                    >
                        <PanelRightOpen className="h-5 w-5 mb-2" />
                        {t('builder.diagramGenerator.toolsTitle')}
                    </Button>
                </div>
            )}

            {/* Left Column */}
            <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <DiagramGenerationTools onCollapseToggle={() => setIsPanelCollapsed(true)} />
            </div>

            {/* Center Column */}
            <div className={cn("lg:overflow-y-auto lg:pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                 <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-headline">{t('builder.diagramGenerator.title')}</CardTitle>
                         <CardDescription>
                            {t('builder.diagramGenerator.description')}
                         </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {generatedDiagrams.length > 0 ? (
                            <Accordion type="multiple" className="w-full space-y-4">
                              {generatedDiagrams.map(key => {
                                const diagramData = diagrams![key]!;
                                const Icon = diagramConfig[key].icon;
                                return (
                                   <AccordionItem value={key} key={key} className="bg-background rounded-lg border">
                                      <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                                         <div className="flex items-center">
                                              <Icon className="me-2 h-5 w-5 text-primary" />
                                              {t(diagramConfig[key].title)}
                                         </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="p-4 border-t">
                                        <DiagramViewer
                                            diagramKey={key}
                                            diagramData={diagramData}
                                            onCodeChange={(code) => handleDiagramCodeUpdate(key, code)}
                                            onUpdate={() => handleUpdateDiagram(diagramData.plantUmlCode)}
                                            onExplanationSave={(explanation) => setDiagramExplanation(key, explanation)}
                                            isUpdating={mutation.isPending && mutation.variables === diagramData.plantUmlCode}
                                            isReadOnly={mutation.isPending}
                                        />
                                      </AccordionContent>
                                  </AccordionItem>
                                )
                              })}
                            </Accordion>
                         ) : (
                            <div className="flex items-center justify-center h-full min-h-[400px]">
                                <div className="text-center text-muted-foreground p-8">
                                    <GitGraph className="w-16 h-16 mx-auto mb-4" />
                                    <p>{t('builder.diagramGenerator.emptyState')}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
