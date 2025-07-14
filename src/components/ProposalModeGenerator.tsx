
'use client';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, FileText, Download, FileJson } from 'lucide-react';
import ProposalViewer from './ProposalViewer';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { exportProposalAsDocx } from '@/lib/docx-exporter';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { TemplateKey } from '@/lib/docx-styles';
import { saveAs } from 'file-saver';
import { ProposalGenerationTools } from './proposal-generator/ProposalGenerationTools';
import { useBuilderState } from '@/context/BuilderStateContext';


export function ProposalModeGenerator() {
    const { toast } = useToast();
    const { templates: docxTemplates } = useDocxStyles();
    const {
        state,
        dispatch,
        isGeneratingProposal,
        handleGenerateProposal,
    } = useBuilderState();
    
    const [projectIdea, setProjectIdea] = useState('');
    const [customGuidelines, setCustomGuidelines] = useState<string[]>([]);
    const { proposal } = state;


    useEffect(() => {
        if(state.lastGenerated === 'proposal' && state.proposal && !state.error) {
            toast({ title: 'Proposal Generated', description: 'Your project proposal has been created successfully.' });
        }
        if(state.lastGenerated === 'proposal' && state.error) {
            toast({ title: 'Generation Failed', description: state.error, variant: 'destructive' });
        }
    }, [state, toast]);

    const handleExportDocx = () => {
        if(proposal) {
            const templateKey: TemplateKey = Object.keys(docxTemplates)[0] as TemplateKey || 'modern';
            exportProposalAsDocx(proposal, templateKey);
        }
    }
    
    const handleExportJson = () => {
        if (!proposal) return;
        const blob = new Blob([JSON.stringify({ proposal: proposal }, null, 2)], { type: 'application/json;charset=utf-8' });
        const fileName = `${proposal.title.replace(/[\s\W]/g, '_') || 'arkan_proposal'}.json`;
        saveAs(blob, fileName);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleGenerateProposal(projectIdea, customGuidelines);
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Describe Your Project Idea</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Textarea
                                name="projectIdea"
                                placeholder='A mobile app for tracking personal fitness goals, including workouts and nutrition.'
                                rows={8}
                                required
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                disabled={isGeneratingProposal}
                            />
                            {state.lastGenerated === 'proposal' && state.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Center Column */}
                <div className="lg:col-span-6 overflow-y-auto pr-2">
                    {proposal ? (
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1.5">
                                    <CardTitle className="font-headline">Generated Proposal</CardTitle>
                                    <CardDescription>Review the generated details below.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" type="button" onClick={handleExportJson}>
                                        <FileJson className="mr-2 h-4 w-4" />
                                        .json
                                    </Button>
                                    <Button variant="outline" type="button" onClick={handleExportDocx}>
                                        <Download className="mr-2 h-4 w-4" />
                                        DOCX
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[calc(100vh-350px)] overflow-y-auto pr-4">
                                   <ProposalViewer proposal={proposal} readOnly={true} />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="text-center text-muted-foreground p-8">
                                <FileText className="w-16 h-16 mx-auto mb-4" />
                                <p>Your generated project proposal will appear here.</p>
                                {isGeneratingProposal && <Loader2 className="h-8 w-8 animate-spin mt-4 mx-auto" />}
                            </div>
                        </Card>
                    )}
                </div>

                 {/* Right Column */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                    <ProposalGenerationTools
                        isDisabled={!projectIdea || isGeneratingProposal}
                        isGenerating={isGeneratingProposal}
                        customGuidelines={customGuidelines}
                        setCustomGuidelines={setCustomGuidelines}
                    />
                </div>

            </div>
        </form>
    );
}
