
'use client';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, FileText, Download, FileJson } from 'lucide-react';
import ProposalViewer from './ProposalViewer';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { exportProposalAsDocx } from '@/lib/docx-exporter';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { TemplateKey } from '@/lib/docx-styles';
import { ProposalGenerationTools } from './proposal-generator/ProposalGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { saveAs } from 'file-saver';
import { useAuth } from '@/context/AuthContext';


export function ProposalModeGenerator() {
    const { toast } = useToast();
    const { templates: docxTemplates } = useDocxStyles();
    const auth = useAuth();

    const {
        proposal,
        error,
        isGeneratingProposal,
        projectIdea,
        setProjectIdea,
        handleGenerateProposal,
        handleProposalUpdate,
        lastGenerated
    } = useBuilderStore();


    useEffect(() => {
        if(error && lastGenerated === 'proposal') {
            toast({ title: 'Generation Failed', description: error, variant: 'destructive' });
        }
    }, [error, lastGenerated, toast]);

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
        handleGenerateProposal(auth);
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
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
                            {error && lastGenerated === 'proposal' && (
                                <p className="text-sm font-medium text-destructive mt-2">{error}</p>
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
                                    <CardDescription>Review and edit the generated details below.</CardDescription>
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
                                <div className="h-[calc(100vh-310px)] overflow-y-auto pr-4">
                                   <ProposalViewer proposal={proposal} onUpdate={handleProposalUpdate} />
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
                    />
                </div>

            </div>
        </form>
    );
}
