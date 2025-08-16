

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProposalGenerationTools } from './ProposalGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation } from '@tanstack/react-query';
import type { AnyProjectProposal } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { ProposalActions } from './ProposalActions';
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
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    
    const {
        proposal,
        handleProposalUpdate,
        setProposal,
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
             <div className="lg:col-span-4 lg:sticky top-24">
                <ProposalGenerationTools
                    isDisabled={generationMutation.isPending || translateMutation.isPending}
                    isGenerating={generationMutation.isPending}
                />
            </div>
            
            <div className="lg:col-span-8 relative">
                {generationMutation.isPending && (
                    <div className="absolute inset-0 bg-background/80 z-10 flex flex-col items-center justify-center gap-4 rounded-lg">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Generating your proposal, please wait...</p>
                    </div>
                )}
                {proposal ? (
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <CardTitle className="font-headline text-2xl text-primary">
                                        {(proposal as any).title || "Generated Proposal"}
                                    </CardTitle>
                                    <CardDescription>
                                        {(proposal as any).category || "Review the generated proposal"}
                                    </CardDescription>
                                </div>
                                 <div className="flex-none">
                                    <ProposalActions 
                                        isGenerating={generationMutation.isPending}
                                        isTranslating={translateMutation.isPending}
                                        onTranslate={handleTranslateProposal}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                            <Suspense fallback={<ProposalSkeleton/>}>
                                <FormattedProposalView
                                    proposal={proposal}
                                    onUpdate={handleProposalUpdate}
                                    readOnly={generationMutation.isPending || translateMutation.isPending}
                                />
                            </Suspense>
                        </CardContent>
                    </Card>
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
    );
}
