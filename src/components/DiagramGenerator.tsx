
'use client';

import { DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import DiagramViewer from './DiagramViewer';
import { useDiagramState } from '@/context/DiagramStateContext';
import { diagramConfig } from '@/lib/report-config';
import { GitGraph } from 'lucide-react';
import { ProposalEditor } from './report-generator/ProposalEditor'; // Reusing this component
import { DiagramGenerationTools } from './diagram-generator/DiagramGenerationTools';
import { Skeleton } from './ui/skeleton';


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
        proposalJson,
        setProposalJson,
        isAnythingGenerating,
        generatingDiagram,
        handleFormSubmit,
        handleDiagramCodeUpdate,
        handleDiagramUpdate,
        contextSelections,
        toggleContextSelection,
    } = useDiagramState();

    const currentDiagramType = state.lastGenerated;
    const currentDiagramData = currentDiagramType ? state.diagrams?.[currentDiagramType] : undefined;

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(new FormData(e.currentTarget)); }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">

                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                    <ProposalEditor
                        proposalJson={proposalJson}
                        onProposalJsonChange={setProposalJson}
                        isDisabled={isAnythingGenerating}
                        error={state.error && !generatingDiagram ? state.error : undefined}
                    />
                </div>

                {/* Center Column */}
                <div className="lg:col-span-6 overflow-y-auto pr-2">
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
                                    isReadOnly={isAnythingGenerating}
                                />
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
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                    <DiagramGenerationTools
                        isDisabled={!proposalJson || isAnythingGenerating}
                        diagramsState={state.diagrams || {}}
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
