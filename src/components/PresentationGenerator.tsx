
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Presentation, FileJson, GitGraph, BookCheck } from 'lucide-react';
import PresentationViewer from './PresentationViewer';
import { usePresentationState } from '@/context/PresentationStateContext';
import { ProposalEditor } from './report-generator/ProposalEditor';
import { PresentationGenerationTools } from './presentation-generator/PresentationGenerationTools';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import { cn } from '@/lib/utils';
import { PresentationActions } from './presentation-generator/PresentationActions';


export default function PresentationGenerator() {
    const {
        state,
        isGenerating,
        proposalJson,
        setProposalJson,
        reportState,
        setReportState,
        handleGeneratePresentation,
        contextSelections,
        toggleContextSelection,
    } = usePresentationState();
    
    const [showPresentation, setShowPresentation] = useState(false);

    useEffect(() => {
        if (state.slides && state.slides.length > 0) {
            setShowPresentation(true);
        }
    }, [state.slides]);

    const isToolsDisabled = !proposalJson || isGenerating;
    
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleGeneratePresentation(new FormData(e.currentTarget)); }} className="space-y-6">
             <input type="hidden" name="proposalJson" value={proposalJson} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">

                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                     <ProposalEditor
                        proposalJson={proposalJson}
                        onProposalJsonChange={setProposalJson}
                        isDisabled={isGenerating}
                        error={state.error}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-base">Upload Report File</CardTitle>
                            <CardDescription className="text-xs">
                                Upload a saved `.json` project file to use its sections and diagrams as context.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <input
                                type="file"
                                accept=".json"
                                onChange={(e) => setReportState(e.target.files?.[0])}
                                className="text-xs w-full"
                                disabled={isGenerating}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Center Column */}
                <div className="lg:col-span-6 overflow-y-auto pr-2">
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
                     <PresentationViewer 
                        isOpen={showPresentation} 
                        onOpenChange={setShowPresentation} 
                        slides={state.slides} 
                     />
                )}

                {/* Right Column */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                    <PresentationActions 
                        isGenerating={isGenerating}
                        slides={state.slides}
                    />
                     <PresentationGenerationTools
                        isDisabled={isToolsDisabled}
                        isGenerating={isGenerating}
                        reportState={reportState}
                        contextSelections={contextSelections}
                        onContextToggle={toggleContextSelection}
                    />
                </div>

            </div>
        </form>
    );
}
