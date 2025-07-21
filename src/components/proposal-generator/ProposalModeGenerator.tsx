
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Loader2, FileText, Download, FileJson, Languages } from 'lucide-react';
import ProposalViewer from './ProposalViewer';
import { useToast } from '@/hooks/use-toast';
import { exportProposalAsDocx } from '@/lib/docx-exporter';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { TemplateKey } from '@/lib/docx-styles';
import { ProposalGenerationTools } from './ProposalGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { saveAs } from 'file-saver';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectProposal } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate } from '@/hooks/use-translation';
import { useState } from 'react';


function ProposalSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                     <div className="flex gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                </div>
            </CardContent>
        </Card>
    )
}

// The async function for the mutation
async function generateProposal(variables: { body: any; token: string; }): Promise<ProjectProposal> {
    const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}` 
        },
        body: JSON.stringify(variables.body)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate proposal');
    }
    return response.json();
}


export function ProposalModeGenerator() {
    const { toast } = useToast();
    const { t, locale } = useLocalization();
    const { templates: docxTemplates } = useDocxStyles();
    const { firebaseUser, refetchUser } = useAuth();
    const queryClient = useQueryClient();
    const translateMutation = useTranslate();
    const [isTranslating, setIsTranslating] = useState(false);

    const {
        proposal,
        projectIdea,
        setProjectIdea,
        handleProposalUpdate,
        setProposal,
        selectedTemplateId,
        customGuidelines,
    } = useBuilderStore();


    const mutation = useMutation({
        mutationFn: generateProposal,
        onSuccess: (data) => {
            setProposal(data);
            refetchUser(); // Invalidate user query to update credits
            toast({ title: t('builder.toasts.generationSuccess'), description: t('builder.toasts.generationSuccessDesc', {item: 'Proposal'}) });
        },
        onError: (error: Error) => {
            toast({ title: t('builder.toasts.generationFailed'), description: error.message, variant: 'destructive' });
        }
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: t('builder.toasts.authError'), variant: "destructive" });
            return;
        }

        const token = await firebaseUser.getIdToken();
        if (!token) {
             toast({ title: 'Authentication Error', description: 'Could not verify your session. Please log in again.', variant: 'destructive' });
            return;
        }

        const body = {
            projectIdea,
            templateId: selectedTemplateId,
            customGuidelines,
        }

        mutation.mutate({ body, token });
    };

    const handleTranslateProposal = async () => {
        if (!proposal || !firebaseUser) return;
        
        setIsTranslating(true);
        toast({
            title: t('builder.proposalGenerator.toasts.translateAllStarted'),
            description: t('builder.proposalGenerator.toasts.translateAllStartedDesc'),
        });
        
        const targetLang = locale === 'en' ? 'ar' : 'en';
        
        const deepTranslate = async (obj: any): Promise<any> => {
            if (typeof obj === 'string') {
                try {
                    const result = await translateMutation.mutateAsync({ text: obj, targetLang });
                    return result.translatedText;
                } catch (e) {
                    console.warn(`Translation failed for text: "${obj}"`, e);
                    return obj; // Return original text on failure
                }
            }
            if (Array.isArray(obj)) {
                return Promise.all(obj.map(item => deepTranslate(item)));
            }
            if (typeof obj === 'object' && obj !== null) {
                const newObj: { [key: string]: any } = {};
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        // Skip non-translatable fields
                        if (['startDate', 'endDate', 'durationWeeks', 'totalAmount', 'cost', 'currency'].includes(key)) {
                            newObj[key] = obj[key];
                        } else {
                            newObj[key] = await deepTranslate(obj[key]);
                        }
                    }
                }
                return newObj;
            }
            return obj;
        };

        try {
            const translatedProposal = await deepTranslate(proposal);
            setProposal(translatedProposal);
            toast({
                title: t('builder.proposalGenerator.toasts.translateAllSuccess'),
                description: t('builder.proposalGenerator.toasts.translateAllSuccessDesc'),
            });
        } catch (error: any) {
            toast({
                title: t('builder.proposalGenerator.toasts.translateAllFailed'),
                description: error.message || t('builder.proposalGenerator.toasts.translateAllFailedDesc'),
                variant: 'destructive'
            });
        } finally {
            setIsTranslating(false);
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-180px)]">
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">{t('builder.proposalGenerator.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Textarea
                                name="projectIdea"
                                placeholder={t('builder.proposalGenerator.placeholder')}
                                rows={8}
                                required
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                disabled={mutation.isPending}
                            />
                            {mutation.isError && (
                                <p className="text-sm font-medium text-destructive mt-2">{mutation.error.message}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Center Column */}
                <div className="lg:col-span-6 lg:overflow-y-auto lg:pr-2">
                    {proposal ? (
                         <Card>
                            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <CardTitle className="font-headline">{t('builder.proposalGenerator.generatedTitle')}</CardTitle>
                                    <CardDescription>{t('builder.proposalGenerator.generatedDescription')}</CardDescription>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                     <Button variant="outline" type="button" size="sm" onClick={handleTranslateProposal} disabled={isTranslating}>
                                        {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                                        {t('builder.proposalGenerator.translateAllButton')}
                                    </Button>
                                    <Button variant="outline" type="button" size="sm" onClick={handleExportJson}>
                                        <FileJson className="mr-2 h-4 w-4" />
                                        {t('builder.proposalGenerator.exportJson')}
                                    </Button>
                                    <Button variant="outline" type="button" size="sm" onClick={handleExportDocx}>
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('builder.proposalGenerator.exportDocx')}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="lg:h-[calc(100vh-310px)] overflow-y-auto pr-4">
                                   <ProposalViewer proposal={proposal} onUpdate={handleProposalUpdate} />
                                </div>
                            </CardContent>
                        </Card>
                    ) : mutation.isPending ? (
                        <ProposalSkeleton />
                    ) : (
                        <Card className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="text-center text-muted-foreground p-8">
                                <FileText className="w-16 h-16 mx-auto mb-4" />
                                <p>{t('builder.proposalGenerator.emptyState')}</p>
                            </div>
                        </Card>
                    )}
                </div>

                 {/* Right Column */}
                <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
                    <ProposalGenerationTools
                        isDisabled={!projectIdea || mutation.isPending}
                        isGenerating={mutation.isPending}
                    />
                </div>

            </div>
        </form>
    );
}
