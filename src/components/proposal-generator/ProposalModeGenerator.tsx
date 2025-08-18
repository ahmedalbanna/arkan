

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProposalGenerationTools } from './ProposalGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation } from '@tanstack/react-query';
import type { AnyProjectProposal, ProjectProposal } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { ProposalActions } from './ProposalActions';
import { lazy, Suspense, useState, useEffect } from 'react';
import { translateProposalApi } from '@/services/translation-service';
import { useGenerateProposal } from '@/hooks/use-proposal-generation';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { ProjectProposalSchema } from '@/ai/schemas';
import { useIsMobile } from '@/hooks/use-mobile';

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

const A4Page = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div className="bg-background shadow-lg p-8 md:p-16 mx-auto my-4" style={{ width: '210mm', minHeight: '297mm' }}>
        {children}
    </div>
);


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
            setProposal(data as ProjectProposal);
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
        translateMutation.mutate({ proposal: proposal as AnyProjectProposal, targetLang, token });
    };

    const orderedKeys = proposal ? Object.keys(ProjectProposalSchema.shape).filter(k => k !== 'title' && k !== 'category') : [];
    const totalPages = orderedKeys.length > 0 ? orderedKeys.length + 1 : 0; // +1 for the title page
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1);
    const isMobile = useIsMobile();

    useEffect(() => {
        setCurrentPage(0);
    }, [proposal]);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const isBusy = generationMutation.isPending || translateMutation.isPending;

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
             {generationMutation.isPending && (
                <div className="absolute inset-0 bg-background/80 z-20 flex flex-col items-center justify-center gap-4 rounded-lg p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating your proposal, please wait...</p>
                </div>
            )}
             <div className="lg:col-span-4 lg:sticky top-24">
                <ProposalGenerationTools
                    isDisabled={isBusy}
                    isGenerating={generationMutation.isPending}
                />
            </div>

            <div className="lg:col-span-8 w-full">
                 <div className="h-full flex flex-col">
                     <CardHeader className="bg-background rounded-t-lg p-4 border-b">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <CardTitle className="font-headline text-2xl text-primary truncate" title={proposal?.title || "Generated Proposal"}>
                                    {proposal?.title || "Generated Proposal"}
                                </CardTitle>
                                <CardDescription>
                                    {proposal?.category || "Review the generated proposal"}
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
                    <div className="flex-grow bg-slate-200 dark:bg-slate-900/50 p-4 rounded-b-lg">
                         <ScrollArea className={isMobile ? "h-[calc(100vh-350px)]" : "h-[calc(100vh-280px)]"}>
                            <div className={isMobile ? "" : "scale-animation"} style={{ transform: isMobile ? 'none' : `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                                {proposal ? (
                                    <Suspense fallback={<ProposalSkeleton/>}>
                                        <FormattedProposalView
                                            proposal={proposal}
                                            onUpdate={handleProposalUpdate}
                                            readOnly={isBusy}
                                            currentPage={currentPage}
                                        />
                                    </Suspense>
                                ) : (
                                    <div className="flex items-center justify-center h-full min-h-[400px]">
                                        <div className="text-center text-muted-foreground p-8">
                                            <FileText className="w-16 h-16 mx-auto mb-4" />
                                            <p>{t('builder.proposalGenerator.emptyState')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                     {proposal && totalPages > 1 && (
                        <div className="flex justify-center items-center p-2 border-t bg-background rounded-b-lg">
                            <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                {t('builder.presentationGenerator.prev')}
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground mx-4">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
                                {t('builder.presentationGenerator.next')}
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                            <div className="flex-grow" />
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                                <span className="text-sm font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
                                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
