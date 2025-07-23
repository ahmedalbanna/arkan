
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Loader2, FileText, Download, FileJson, Languages } from 'lucide-react';
import ProposalViewer from './ProposalViewer';
import { useToast } from '@/hooks/use-toast';
import { ProposalGenerationTools } from './ProposalGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectProposal } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { ProposalActions } from './ProposalActions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

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

async function translateProposal(variables: { proposal: ProjectProposal, targetLang: string, token: string }): Promise<ProjectProposal> {
    const response = await fetch('/api/translate-proposal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify({ proposal: variables.proposal, targetLang: variables.targetLang })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to translate proposal');
    }
    return response.json();
}


export function ProposalModeGenerator() {
    const { toast } = useToast();
    const { t, locale } = useLocalization();
    const { firebaseUser, refetchUser } = useAuth();
    const queryClient = useQueryClient();

    const {
        proposal,
        projectIdea,
        setProjectIdea,
        handleProposalUpdate,
        setProposal,
        selectedTemplateId,
        customGuidelines,
    } = useBuilderStore();


    const generationMutation = useMutation({
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

    const translateMutation = useMutation({
        mutationFn: translateProposal,
        onSuccess: (data) => {
            setProposal(data);
            refetchUser(); // Invalidate to update credits
            toast({
                title: t('builder.proposalGenerator.toasts.translateAllSuccess'),
                description: t('builder.proposalGenerator.toasts.translateAllSuccessDesc'),
            });
        },
        onError: (error: Error) => {
             toast({
                title: t('builder.proposalGenerator.toasts.translateAllFailed'),
                description: error.message || t('builder.proposalGenerator.toasts.translateAllFailedDesc'),
                variant: 'destructive'
            });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: t('builder.toasts.authError'), variant: "destructive" });
            return;
        }

        const token = await firebaseUser.getIdToken();
        const body = {
            projectIdea,
            templateId: selectedTemplateId,
            customGuidelines,
            locale,
        }
        generationMutation.mutate({ body, token });
    };

    const handleTranslateProposal = async (targetLang: 'en' | 'ar') => {
        if (!proposal || !firebaseUser) return;

        toast({
            title: t('builder.proposalGenerator.toasts.translateAllStarted'),
            description: t('builder.proposalGenerator.toasts.translateAllStartedDesc'),
        });

        const token = await firebaseUser.getIdToken();
        translateMutation.mutate({ proposal, targetLang, token });
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-180px)]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
                    <ProposalGenerationTools
                        isDisabled={!projectIdea || generationMutation.isPending}
                        isGenerating={generationMutation.isPending}
                    />
                    {proposal && (
                        <ProposalActions isGenerating={generationMutation.isPending} />
                    )}
                </div>


                {/* Center Column */}
                <div className="lg:col-span-6 lg:overflow-y-auto lg:pr-2">
                    {proposal ? (
                         <Card>
                            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <CardTitle className="font-headline text-2xl text-primary">
                                        <EditableField value={proposal.title} path="title" onUpdate={handleProposalUpdate} readOnly={generationMutation.isPending || translateMutation.isPending} />
                                    </CardTitle>
                                    <CardDescription>
                                        <EditableField value={proposal.category} path="category" onUpdate={handleProposalUpdate} readOnly={generationMutation.isPending || translateMutation.isPending} />
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" disabled={translateMutation.isPending}>
                                                {translateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                                                Translate Proposal
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleTranslateProposal('en')} disabled={translateMutation.isPending}>
                                                Translate to English
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleTranslateProposal('ar')} disabled={translateMutation.isPending}>
                                                Translate to Arabic
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="lg:h-[calc(100vh-310px)] overflow-y-auto pr-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                   <ProposalViewer proposal={proposal} onUpdate={handleProposalUpdate} readOnly={generationMutation.isPending || translateMutation.isPending} />
                                </div>
                            </CardContent>
                        </Card>
                    ) : generationMutation.isPending ? (
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
                                value={projectIdea[locale] || ''}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                disabled={generationMutation.isPending}
                            />
                            {generationMutation.isError && (
                                <p className="text-sm font-medium text-destructive mt-2">{generationMutation.error.message}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </form>
    );
}
