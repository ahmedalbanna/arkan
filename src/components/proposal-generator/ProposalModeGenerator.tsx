

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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { ScrollArea } from '../ui/scroll-area';

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
         <ResizablePanelGroup 
            direction="horizontal" 
            className="h-full items-stretch"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
            <ResizablePanel defaultSize={33} minSize={25}>
                <div className="h-full overflow-y-auto pr-2">
                    <ProposalGenerationTools
                    isDisabled={generationMutation.isPending || translateMutation.isPending}
                    isGenerating={generationMutation.isPending}
                    />
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={67} minSize={40}>
                <div className="h-full overflow-y-auto pl-2">
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
                             <CardContent className="flex-grow overflow-hidden">
                                <ScrollArea className="h-full pr-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                    <Suspense fallback={<ProposalSkeleton/>}>
                                        <FormattedProposalView
                                            proposal={proposal}
                                            onUpdate={handleProposalUpdate}
                                            readOnly={generationMutation.isPending || translateMutation.isPending}
                                        />
                                    </Suspense>
                                </ScrollArea>
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
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
