
'use client';

import { useState, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGeneratePresentation, type PresentationState } from '@/app/generate-presentation/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Presentation } from 'lucide-react';
import { useAgents } from '@/hooks/use-agents';
import PresentationViewer from './PresentationViewer';

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full font-headline">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Presentation
                </>
            )}
        </Button>
    );
}

export default function PresentationGenerator() {
    const initialState: PresentationState = {};
    const [state, formAction] = useActionState(handleGeneratePresentation, initialState);

    const [proposalJson, setProposalJson] = useState('');
    const { agents, isLoaded } = useAgents();
    const [showPresentation, setShowPresentation] = useState(false);
    
    const presentationAgent = agents.find(a => a.id === 'generate-presentation');

    useEffect(() => {
        if (state.slides && state.slides.length > 0) {
            setShowPresentation(true);
        }
    }, [state.slides]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Project Proposal (JSON)</CardTitle>
                            <CardDescription>
                                Paste the full JSON content of your project proposal to generate a presentation from it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="proposalJson"
                                placeholder='{ "title": "...", "objective": "...", ... }'
                                rows={15}
                                required
                                value={proposalJson}
                                onChange={(e) => setProposalJson(e.target.value)}
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <GenerateButton />
                        </CardFooter>
                    </Card>
                </div>
                <div className="md:col-span-2">
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
            </div>
            {state.slides && state.slides.length > 0 && (
                 <PresentationViewer 
                    isOpen={showPresentation} 
                    onOpenChange={setShowPresentation} 
                    slides={state.slides} 
                 />
            )}
        </form>
    );
}
