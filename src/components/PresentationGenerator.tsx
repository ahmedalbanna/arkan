
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Presentation, AlertCircle, History } from 'lucide-react';
import PresentationViewer from './PresentationViewer';
import { PresentationGenerationTools } from './presentation-generator/PresentationGenerationTools';
import { useBuilderState } from '@/context/BuilderStateContext';
import { lazy } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const DynamicPresentationViewer = lazy(() => import('./PresentationViewer'));


export default function PresentationGenerator() {
    const {
        state,
        handleGeneratePresentation,
        setActivePresentationId,
        handleGuidelineToggle,
        setCustomGuidelineInput,
        handleAddCustomGuideline,
        handleRemoveCustomGuideline,
        toggleContextSelection,
    } = useBuilderState();

    const { proposal, sections, diagrams, isAnythingGenerating, presentation, activePresentationId, contextSelections, guidelineState, customGuidelineInput } = state;
    
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

    const presentations = presentation?.history || [];
    const activePresentation = presentations.find(p => p.id === activePresentationId);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <History className="w-6 h-6" />
                           History
                        </CardTitle>
                        <CardDescription>Select a previously generated presentation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                             {presentations.length > 0 ? (
                                <div className="space-y-2">
                                    {presentations.map(p => {
                                         const isValidDate = p.id && !isNaN(new Date(p.id).getTime());
                                         return (
                                             <Button
                                                 key={p.id}
                                                 variant="ghost"
                                                 onClick={() => setActivePresentationId(p.id)}
                                                 className={cn(
                                                     "w-full h-auto justify-start text-left p-2",
                                                     activePresentation?.id === p.id && "bg-muted"
                                                 )}
                                             >
                                                 <div className="flex flex-col">
                                                    <span>{p.name} ({(p.slides || []).length} slides)</span>
                                                    {isValidDate && (
                                                         <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(p.id), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                 </div>
                                             </Button>
                                         )
                                    })}
                                </div>
                             ) : (
                                <p className="text-sm text-muted-foreground text-center">No presentations generated yet.</p>
                             )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>


            {/* Center Column */}
            <div className="lg:col-span-5 overflow-y-auto pr-2">
                {activePresentation?.slides && activePresentation.slides.length > 0 ? (
                    <DynamicPresentationViewer
                        key={activePresentation.id}
                        slides={activePresentation.slides}
                    />
                ) : (
                    <Card className="flex items-center justify-center h-full min-h-[300px]">
                        <div className="text-center text-muted-foreground p-8">
                            <Presentation className="w-16 h-16 mx-auto mb-4" />
                            <p>Your generated presentation will appear here.</p>
                            {isAnythingGenerating && activePresentation === undefined && <Loader2 className="h-8 w-8 animate-spin mt-4 mx-auto" />}
                        </div>
                    </Card>
                )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
                <PresentationGenerationTools
                    isDisabled={!proposal || isAnythingGenerating}
                    isGenerating={isAnythingGenerating}
                    onGenerate={handleGeneratePresentation}
                    sections={sections || {}}
                    diagrams={diagrams || {}}
                    contextSelections={contextSelections}
                    onContextToggle={toggleContextSelection}
                    presentations={presentations}
                    guidelineState={guidelineState.presentation}
                    onGuidelineToggle={(index, checked) => handleGuidelineToggle('presentation', index, checked)}
                    customGuidelineInput={customGuidelineInput['presentation'] || ''}
                    onCustomGuidelineChange={(value) => setCustomGuidelineInput('presentation', value)}
                    onAddCustomGuideline={() => handleAddCustomGuideline('presentation')}
                    onRemoveCustomGuideline={(index) => handleRemoveCustomGuideline('presentation', index)}
                />
            </div>
        </div>
    );
}
