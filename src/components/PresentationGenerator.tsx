
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Presentation, AlertCircle } from 'lucide-react';
import PresentationViewer from './PresentationViewer';
import { PresentationGenerationTools } from './presentation-generator/PresentationGenerationTools';
import { usePresentationState } from '@/context/PresentationStateContext';
import { lazy } from 'react';

const DynamicPresentationViewer = lazy(() => import('./PresentationViewer'));


export default function PresentationGenerator() {
    const {
        state,
        isGenerating,
        proposal,
        handleGeneratePresentation,
        sections,
        diagrams,
        contextSelections,
        toggleContextSelection,
    } = usePresentationState();
    
    const [showPresentation, setShowPresentation] = useState(false);

    useEffect(() => {
        if (state.slides && state.slides.length > 0) {
            setShowPresentation(true);
        }
    }, [state.slides]);

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
    
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleGeneratePresentation(); }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">

                {/* Center Column */}
                <div className="lg:col-span-8 overflow-y-auto pr-2">
                    {state?.slides && state.slides.length > 0 ? (
                        <>
                         <Alert className="mb-6">
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle className="font-headline">Generation Complete!</AlertTitle>
                            <AlertDescription>
                                A {state.slides.length}-slide presentation has been generated. Click below to view and export it.
                            </AlertDescription>
                        </Alert>
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="font-headline">Presentation Ready</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Presentation className="w-24 h-24 text-primary mx-auto" />
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button type="button" onClick={() => setShowPresentation(true)}>View Presentation</Button>
                            </CardFooter>
                        </Card>
                        </>
                    ) : (
                        <Card className="flex items-center justify-center h-full min-h-[300px]">
                            <div className="text-center text-muted-foreground p-8">
                                <Presentation className="w-16 h-16 mx-auto mb-4" />
                                <p>Your generated presentation will appear here.</p>
                                {isGenerating && <Loader2 className="h-8 w-8 animate-spin mt-4 mx-auto" />}
                            </div>
                        </Card>
                    )}
                </div>
                 {state.slides && state.slides.length > 0 && (
                     <DynamicPresentationViewer
                        isOpen={showPresentation} 
                        onOpenChange={setShowPresentation} 
                        slides={state.slides} 
                     />
                )}

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
                     <PresentationGenerationTools
                        isDisabled={!proposal || isGenerating}
                        isGenerating={isGenerating}
                        onGenerate={handleGeneratePresentation}
                        sections={sections}
                        diagrams={diagrams}
                        contextSelections={contextSelections}
                        onContextToggle={toggleContextSelection}
                        slides={state.slides}
                    />
                </div>

            </div>
        </form>
    );
}
