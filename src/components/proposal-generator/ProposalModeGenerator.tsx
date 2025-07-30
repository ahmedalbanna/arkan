
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Languages, FileText } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { lazy, Suspense } from 'react';
import { translateProposalApi } from '@/services/translation-service';
import { useGenerateProposal } from '@/hooks/use-proposal-generation';

const FormattedProposalView = lazy(() => import('./FormattedProposalView'));

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

export function ProposalModeGenerator() {
    const { toast } = useToast();
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    
    const {
        proposal,
        projectIdea,
        handleProposalUpdate,
        setProposal,
        selectedTemplateId,
        customGuidelines,
    } = useBuilderStore();

    const generationMutation = useGenerateProposal();

    const translateMutation = useMutation({
        mutationFn: translateProposalApi,
        onSuccess: (data) => {
            setProposal(data);
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
        const body = {
            projectIdea,
            templateId: selectedTemplateId,
            customGuidelines,
        }
        generationMutation.mutate(body);
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
                                <div className="lg:h-[calc(100vh-295px)] overflow-y-auto pr-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                    <Suspense fallback={<ProposalSkeleton/>}>
                                        <FormattedProposalView
                                            proposal={proposal}
                                            onUpdate={handleProposalUpdate}
                                            readOnly={generationMutation.isPending || translateMutation.isPending}
                                        />
                                    </Suspense>
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
