
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components
import { useProposalModeGeneratorLogic } from '@/hooks';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Code, File, FileText, Loader2, PanelLeftClose, PanelRightOpen, ZoomIn, ZoomOut } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { ProposalActions } from './ProposalActions';
import { ProposalGenerationTools } from './ProposalGenerationTools'; // Import the new component

const FormattedProposalView = lazy(() => import('./FormattedProposalView'));
const MarkdownProposalView = lazy(() => import('./MarkdownProposalView')); // Import the new Markdown view

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
        isPanelCollapsed,
        setIsPanelCollapsed,
        markdownContent,
    } = useProposalModeGeneratorLogic();

    const [viewMode, setViewMode] = useState<'formatted' | 'markdown'>('formatted');

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {generationMutation.isPending && (
                <div className="absolute inset-0 bg-background/80 z-20 flex flex-col items-center justify-center gap-4 rounded-lg p-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">{t('builder.proposalGenerator.toasts.generatingDesc')}</p>
                </div>
            )}
            {isPanelCollapsed && (
                <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
                    <Button
                        variant="secondary"
                        className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                        onClick={() => setIsPanelCollapsed(false)}
                    >
                        <PanelRightOpen className="h-5 w-5 mb-2" />
                        {t('builder.proposalGenerator.toolsTitle')}
                    </Button>
                </div>
            )}

            <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <ProposalGenerationTools isDisabled={generationMutation.isPending || translateMutation.isPending} />
            </div>

            <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                <Card className="h-full flex flex-col overflow-hidden">
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
                                    {isPanelCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                                </Button>
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
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'formatted' | 'markdown')} className="flex flex-col flex-grow">
                        <div className="flex justify-between items-center px-4 py-2 border-y bg-background">
                            <TabsList>
                                <TabsTrigger value="formatted"><File className="me-2 h-4 w-4" /> Formatted</TabsTrigger>
                                <TabsTrigger value="markdown"><Code className="me-2 h-4 w-4" /> Markdown</TabsTrigger>
                            </TabsList>
                            {viewMode === 'formatted' && totalPages > 1 && (
                                <div className="flex items-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
                                </div>
                            )}
                            {viewMode === 'formatted' && (
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                                    <span className="text-sm font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
                                    <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                                </div>
                            )}
                        </div>
                        <CardContent className="flex-1 p-0 bg-slate-200 dark:bg-slate-900/50">
                            <ScrollArea className="h-full p-4">
                                <TabsContent value="formatted" className="m-0">
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
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="markdown" className="m-0">
                                    {!proposal ? (
                                        <div className="flex items-center justify-center h-full min-h-[400px]">
                                            <div className="text-center text-muted-foreground p-8">
                                                <FileText className="w-16 h-16 mx-auto mb-4" />
                                                <p>{t('builder.proposalGenerator.emptyState')}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <Suspense fallback={<ProposalSkeleton />}>
                                            <MarkdownProposalView content={markdownContent} />
                                        </Suspense>
                                    )}
                                </TabsContent>
                            </ScrollArea>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
