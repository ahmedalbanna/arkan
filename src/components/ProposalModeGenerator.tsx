
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateProposal, type ProposalGenerationState } from '@/app/generate-proposal/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, FileText, Download } from 'lucide-react';
import ProposalViewer from './ProposalViewer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { exportProposalAsDocx } from '@/lib/docx-exporter';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { TemplateKey } from '@/lib/docx-styles';

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="font-headline">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Proposal
                </>
            )}
        </Button>
    );
}

export function ProposalModeGenerator() {
    const { fetchUser } = useAuth();
    const { toast } = useToast();
    const { templates: docxTemplates } = useDocxStyles();

    const initialState: ProposalGenerationState = {};
    const [state, formAction] = useActionState(handleGenerateProposal, initialState);

    useEffect(() => {
        if(state.proposal && !state.error) {
            toast({ title: 'Proposal Generated', description: 'Your project proposal has been created successfully.' });
            fetchUser();
        }
        if(state.error) {
            toast({ title: 'Generation Failed', description: state.error, variant: 'destructive' });
        }
    }, [state, fetchUser, toast]);

    const handleExport = () => {
        if(state.proposal) {
            // For simplicity, we use the first available template, 'modern'.
            // A more advanced implementation could let the user choose.
            const templateKey: TemplateKey = Object.keys(docxTemplates)[0] as TemplateKey || 'modern';
            exportProposalAsDocx(state.proposal, templateKey);
        }
    }


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <form action={formAction}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Generate a Project Proposal</CardTitle>
                            <CardDescription>
                                Start with a simple idea, and the AI will generate a complete, professional project proposal for you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Textarea
                                name="projectIdea"
                                placeholder='A mobile app for tracking personal fitness goals, including workouts and nutrition.'
                                rows={8}
                                required
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <GenerateButton />
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <div>
                 {state.proposal ? (
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="font-headline">Generated Proposal</CardTitle>
                                <CardDescription>Review the generated details below.</CardDescription>
                            </div>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export as DOCX
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[calc(100vh-280px)] overflow-y-auto pr-4">
                               <ProposalViewer proposal={state.proposal} readOnly={true} />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center text-muted-foreground p-8">
                            <FileText className="w-16 h-16 mx-auto mb-4" />
                            <p>Your generated project proposal will appear here.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
