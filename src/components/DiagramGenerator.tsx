
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import DiagramViewer from './DiagramViewer';
import { useDiagramState } from '@/context/DiagramStateContext';
import { diagramConfig } from '@/lib/report-config';
import { GitGraph, AlertCircle, Loader2 } from 'lucide-react';
import { DiagramGenerationTools } from './diagram-generator/DiagramGenerationTools';
import { Skeleton } from './ui/skeleton';
import { useBuilderState } from '@/context/BuilderStateContext';

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
        state,
        isAnythingGenerating,
        generatingDiagram,
        handleFormSubmit,
        handleDiagramCodeUpdate,
        handleDiagramUpdate,
        contextSelections,
        toggleContextSelection,
    } = useDiagramState();
    
    const { state: builderState, isLoaded } = useBuilderState();

    const currentDiagramType = state.lastGenerated;
    const currentDiagramData = currentDiagramType ? state.diagrams?.[currentDiagramType] : undefined;

    if (!isLoaded) {
      return (
          <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
    }

    if (!builderState.proposal) {
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

    // Conditional rendering based on currentDiagramData
    if (!currentDiagramData) {
      return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-muted-foreground p-8">
            <GitGraph className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Diagram Generated Yet</h3>
            <p>Please use the form above to generate a diagram.</p>
          </div>
        </Card>
      );
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(new FormData(e.currentTarget)); }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">

                {/* Center Column */}
                <div className="lg:col-span-8 overflow-y-auto pr-2">
                     <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="font-headline">Diagram Preview</CardTitle>
                             <CardDescription>
                                {currentDiagramData ? `Showing: ${diagramConfig[currentDiagramType!].title}` : 'Your generated diagram will appear here.'}
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {generatingDiagram && !currentDiagramData ? (
                                <DiagramSkeleton />
                             ) : currentDiagramData ? (
                                <DiagramViewer
                                   title={diagramConfig[currentDiagramType!].title}
                                   imageUrl={currentDiagramData.imageUrl}
                                   plantUmlCode={currentDiagramData.plantUmlCode}
                                   onCodeChange={(code) => handleDiagramCodeUpdate(currentDiagramType!, code)}
                                   onUpdate={() => handleDiagramUpdate(currentDiagramType!, currentDiagramData.plantUmlCode)}
                                   isUpdating={isAnythingGenerating && generatingDiagram === currentDiagramType}
                                   isReadOnly={isAnythingGenerating} />
                              ) : (
 <div className="flex items-center justify-center h-full min-h-[400px]">
                                    <div className="text-center text-muted-foreground p-8">
                                        <GitGraph className="w-16 h-16 mx-auto mb-4" />
                                        <p>Generate a diagram to get started.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
                    <DiagramGenerationTools
                        isDisabled={!builderState.proposal || isAnythingGenerating}
                        diagramsState={state.diagrams || {}}
                        sectionsState={state.sections || {}}
                        isGenerating={isAnythingGenerating}
                        generatingDiagram={generatingDiagram}
                        contextSelections={contextSelections}
                        onContextToggle={toggleContextSelection}
                    />
                </div>
            </div>
        </form>
    );
}
