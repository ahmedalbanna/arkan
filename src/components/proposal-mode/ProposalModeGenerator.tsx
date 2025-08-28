

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { lazy, Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CollapsibleSidePanel } from '@/components/ui/CollapsibleSidePanel';
import { useProposalModeGeneratorLogic } from '@/hooks';
import { ProposalActions } from './ProposalActions';

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
    const {
        t,
        locale,
        proposal,
        generationMutation,
        translateMutation,
        handleTranslateProposal,
        totalPages,
        currentPage,
        zoom,
        setZoom,
        isMobile,
        handleNextPage,
        handlePrevPage,
        toolPanels,
    } = useProposalModeGeneratorLogic();

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {generationMutation.isPending && (
                <div className="absolute inset-0 bg-background/80 z-20 flex flex-col items-center justify-center gap-4 rounded-lg p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">{t('builder.proposalGenerator.toasts.generatingDesc')}</p>
                </div>
            )}

            <CollapsibleSidePanel panels={toolPanels} defaultActiveKey="generator" className="col-span-4" />

            <div className="lg:col-span-8">
                 <Card className="h-full flex flex-col overflow-hidden">
                     <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                             <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="font-headline text-2xl text-primary truncate" title={proposal?.title || "Generated Proposal"}>
                                        {proposal?.title || "Generated Proposal"}
                                    </CardTitle>
                                    <CardDescription>
                                        {proposal?.category || "Review the generated proposal"}
                                    </CardDescription>
                                </div>
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
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center p-2 border-y bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
                    <CardContent className="flex-1 p-0 bg-slate-200 dark:bg-slate-900/50">
                        <ScrollArea className="h-full p-4">
                            <div className={isMobile ? "" : "zoomable-content"} style={{ '--zoom-scale': isMobile ? 1 : zoom } as React.CSSProperties}>
                                {!proposal ? (
                                    <div className="flex items-center justify-center h-full min-h-[400px]">
                                        <div className="text-center text-muted-foreground p-8">
                                            <FileText className="w-16 h-16 mx-auto mb-4" />
                                            <p>{t('builder.proposalGenerator.emptyState')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Suspense fallback={<ProposalSkeleton />}>
                                        <FormattedProposalView proposal={proposal} currentPage={currentPage} />
                                    </Suspense>
                                )
                                }
                            </div>
                        </ScrollArea>
                    </CardContent>

                </Card>
            </div>
        </div>
    );
}
