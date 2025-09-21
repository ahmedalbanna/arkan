

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DiagramViewer from './DiagramViewer';
import { GitGraph } from 'lucide-react';
import { DiagramGenerationTools } from './DiagramGenerationTools';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion } from '@/components/ui/accordion';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useDiagramGenerator } from '@/hooks';



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
        getIconComponent,
        diagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagram,
        generatedDiagrams,
    } = useDiagramGenerator();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
                <DiagramGenerationTools />
            </div>

            {/* Center Column */}
            <div className="lg:col-span-8 lg:overflow-y-auto pr-2">
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
                                const diagramConfig = diagramSections[key];
                                if (!diagramData || !diagramConfig) return null;
                                const Icon = getIconComponent(diagramConfig.icon) || GitGraph;
                                return (
                                   <AccordionItem value={key} key={key} className="bg-background rounded-lg border">
                                      <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                                         <div className="flex items-center">
                                              <Icon />
                                              {t(diagramConfig.title)}
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
