
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
    const hasReportContent = Object.keys(reportState.sections).length > 0 || Object.keys(reportState.diagrams).length > 0;

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleGeneratePresentation(); }} className="space-y-6">
             <input type="hidden" name="proposalJson" value={proposalJson} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-150px)]">

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
                    />
                    <Card className={cn(!hasReportContent && "opacity-50 pointer-events-none")}>
                        <CardHeader>
                            <CardTitle className="font-headline text-base">Select Context</CardTitle>
                            <CardDescription className="text-xs">
                                Choose which report sections and diagrams to include as context for the presentation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ScrollArea className="h-64 border rounded-md p-2">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2"><BookCheck className="h-4 w-4" /> Sections</h4>
                                     {Object.entries(reportState.sections).length > 0 ? (
                                        Object.entries(reportState.sections).map(([key, content]) => (
                                            <div key={key} className="flex items-center space-x-2 pl-2">
                                                <Checkbox
                                                    id={`context-section-${key}`}
                                                    name={`context_section_${key}`}
                                                    checked={contextSelections.sections[key as keyof typeof contextSelections.sections]}
                                                    onCheckedChange={() => toggleContextSelection('sections', key)}
                                                    disabled={!content}
                                                />
                                                <Label htmlFor={`context-section-${key}`} className="text-sm font-normal">
                                                    {sectionConfig[key as keyof typeof sectionConfig].title}
                                                </Label>
                                            </div>
                                        ))
                                     ) : (
                                         <p className="text-xs text-muted-foreground p-2">No sections found. Upload a report file.</p>
                                     )}

                                    <h4 className="text-sm font-semibold flex items-center gap-2 pt-2"><GitGraph className="h-4 w-4" /> Diagrams</h4>
                                    {Object.entries(reportState.diagrams).length > 0 ? (
                                        Object.entries(reportState.diagrams).map(([key]) => (
                                            <div key={key} className="flex items-center space-x-2 pl-2">
                                                <Checkbox
                                                    id={`context-diagram-${key}`}
                                                    name={`context_diagram_${key}`}
                                                    checked={contextSelections.diagrams[key as keyof typeof contextSelections.diagrams]}
                                                    onCheckedChange={() => toggleContextSelection('diagrams', key)}
                                                />
                                                <Label htmlFor={`context-diagram-${key}`} className="text-sm font-normal">
                                                    {diagramConfig[key as keyof typeof diagramConfig].title}
                                                </Label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground p-2">No diagrams found. Upload a report file.</p>
                                    )}
                                </div>
                             </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </form>
    );
}
