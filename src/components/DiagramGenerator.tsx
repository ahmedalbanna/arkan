
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import DiagramViewer from './DiagramViewer';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { diagramConfig } from '@/lib/report-config';
import { GitGraph, AlertCircle, Loader2 } from 'lucide-react';
import { DiagramGenerationTools } from './diagram-generator/DiagramGenerationTools';
import { Skeleton } from './ui/skeleton';
import { Accordion } from './ui/accordion';
import { AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import type { DiagramType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';

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
    const auth = useAuth();
    const {
        proposal,
        diagrams,
        isAnythingGenerating,
        lastGenerated,
        handleDiagramCodeUpdate,
        handleDiagramUpdate,
    } = useBuilderStore(state => ({
        proposal: state.proposal,
        diagrams: state.diagrams,
        isAnythingGenerating: state.isAnythingGenerating,
        lastGenerated: state.lastGenerated,
        handleDiagramCodeUpdate: state.handleDiagramCodeUpdate,
        handleDiagramUpdate: state.handleDiagramUpdate,
    }));
    
    const generatingDiagram = isAnythingGenerating && orderedDiagrams.includes(lastGenerated as DiagramType) ? lastGenerated : null;

    if (!proposal) {
      return (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground p-8">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                  <h3 className="text-lg font-semibold">No Proposal Loaded</h3>
                  <p>Please generate a proposal in "Proposal Mode" first, or upload a project file.</p>
              </div>
          </Card>
      )
    }
    
    const generatedDiagrams = orderedDiagrams.filter(key => diagrams?.[key]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">

            {/* Center Column */}
            <div className="lg:col-span-8 overflow-y-auto pr-2">
                 <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-headline">Generated Diagrams</CardTitle>
                         <CardDescription>
                            Review, edit, and update your generated diagrams below.
                         </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {generatedDiagrams.length > 0 ? (
                            <Accordion type="multiple" className="w-full space-y-4">
                              {generatedDiagrams.map(key => {
                                const diagramData = diagrams![key]!;
                                const isUpdatingThis = isAnythingGenerating && generatingDiagram === key;
                                const Icon = diagramConfig[key].icon;
                                return (
                                   <AccordionItem value={key} key={key} className="bg-background rounded-lg border">
                                      <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                                         <div className="flex items-center">
                                              <Icon className="mr-2 h-5 w-5 text-primary" />
                                              {diagramConfig[key].title}
                                         </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="p-4 border-t">
                                        <DiagramViewer
                                            title={diagramConfig[key].title}
                                            imageUrl={diagramData.imageUrl}
                                            plantUmlCode={diagramData.plantUmlCode}
                                            onCodeChange={(code) => handleDiagramCodeUpdate(key, code)}
                                            onUpdate={() => handleDiagramUpdate(key, auth)}
                                            isUpdating={isUpdatingThis}
                                            isReadOnly={isAnythingGenerating}
                                        />
                                      </AccordionContent>
                                  </AccordionItem>
                                )
                              })}
                            </Accordion>
                         ) : isAnythingGenerating ? (
                            <DiagramSkeleton />
                         ) : (
                            <div className="flex items-center justify-center h-full min-h-[400px]">
                                <div className="text-center text-muted-foreground p-8">
                                    <GitGraph className="w-16 h-16 mx-auto mb-4" />
                                    <p>Your generated diagrams will appear here in an accordion.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
                <DiagramGenerationTools />
            </div>
        </div>
    );
}
