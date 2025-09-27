
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DiagramViewer from './DiagramViewer';
import { GitGraph } from 'lucide-react';
import { DiagramGenerationTools } from './DiagramGenerationTools';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion } from '@/components/ui/accordion';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useDiagramGenerator } from '@/hooks';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { PanelRightOpen } from 'lucide-react';

function DiagramSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export default function DiagramGenerator() {
    const {
        t,
        locale,
        diagramSections,
        diagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagram,
        generatedDiagrams,
    } = useDiagramGenerator();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
             {isPanelCollapsed && (
                <div className="hidden lg:block lg:col-span-1 sticky top-24">
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
            <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
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
                                const diagramData = diagrams![key];
                                const agent = diagramSections[key];
                                if (!diagramData || !agent) return null;
                                return (
                                   <AccordionItem value={key} key={key} className="bg-background rounded-lg border">
                                      <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                                         <div className="flex items-center gap-2">
                                              <GitGraph />
                                              {agent.name}
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
