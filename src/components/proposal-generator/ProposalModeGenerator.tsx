

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Languages, FileText } from 'lucide-react';
import ProposalViewer from './ProposalViewer';
import { useToast } from '@/hooks/use-toast';
import { ProposalGenerationTools } from './ProposalGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AnyProjectProposal } from '@/ai/schemas';
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
async function generateProposal(variables: { body: any; token: string; }): Promise<AnyProjectProposal> {
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
    return await response.json();
}

async function translateProposal(variables: { proposal: AnyProjectProposal, targetLang: string, token: string }): Promise<AnyProjectProposal> {
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
    return await response.json();
}


export function ProposalModeGenerator() {
    const { toast } = useToast();
    const { t, locale } = useLocalization();
    const { firebaseUser, refetchUser } = useAuth();
    const queryClient = useQueryClient();

    const {
        proposal,
        projectIdea,
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
            toast({ title: t('builder.toasts.generationSuccess'), description: t('builder.toasts.generationSuccessDesc').replace('{item}', 'Proposal') });
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
             <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:h-[calc(100vh-180px)]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
                     <ProposalGenerationTools
                        isDisabled={generationMutation.isPending}
                        isGenerating={generationMutation.isPending}
                        isTranslating={translateMutation.isPending}
                        onTranslate={handleTranslateProposal}
                    />
                </div>

                {/* Right Column */}
                 <div className="lg:col-span-7 lg:overflow-y-auto lg:pr-2">
                    {proposal ? (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl text-primary">
                                    {(proposal as any).title || "Generated Proposal"}
                                </CardTitle>
                                <CardDescription>
                                    {(proposal as any).category || "Review the generated proposal"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="lg:h-[calc(100vh-270px)] overflow-y-auto pr-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
            </div>
        </form>
    );
}
