

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProposalModeGeneratorLogic } from '@/hooks';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Code, File, FileText, Loader2, PanelLeftClose, PanelRightOpen, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { ProposalActions } from './ProposalActions';
import { ProposalGenerationTools } from './ProposalGenerationTools';

const FormattedProposalView = lazy(() => import('./FormattedProposalView'));
const MarkdownProposalView = lazy(() => import('./MarkdownProposalView')); // Import the new Markdown view

function ProposalSkeleton() {
    return (
        <AnimatedContainer animation="fade-in-up" delay={0}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <Skeleton className="h-6 w-48 mb-2 bg-gradient-to-r from-muted to-muted/80" />
                            <Skeleton className="h-4 w-64 bg-gradient-to-r from-muted to-muted/80" />
                        </div>
                        <Badge variant="secondary" className="shadow-soft">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Generating
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded bg-gradient-to-r from-muted to-muted/80" />
                            <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted to-muted/80" />
                        </div>
                        <Skeleton className="h-4 w-full bg-gradient-to-r from-muted to-muted/80" />
                        <Skeleton className="h-4 w-5/6 bg-gradient-to-r from-muted to-muted/80" />
                        <Skeleton className="h-4 w-4/6 bg-gradient-to-r from-muted to-muted/80" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded bg-gradient-to-r from-muted to-muted/80" />
                            <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted to-muted/80" />
                        </div>
                        <Skeleton className="h-4 w-full bg-gradient-to-r from-muted to-muted/80" />
                        <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-muted to-muted/80" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded bg-gradient-to-r from-muted to-muted/80" />
                            <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted to-muted/80" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full bg-gradient-to-r from-muted to-muted/80" />
                            <Skeleton className="h-10 w-full bg-gradient-to-r from-muted to-muted/80" />
                        </div>
                    </div>
                    <EnhancedProgress
                        value={75}
                        variant="gradient"
                        indicatorVariant="shimmer"
                        size="lg"
                        className="mt-6"
                    />
                </CardContent>
            </Card>
        </AnimatedContainer>
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
        handleProposalUpdate,
    } = useProposalModeGeneratorLogic();

    const [viewMode, setViewMode] = useState<'formatted' | 'markdown'>('formatted');

    return (
        <div className="relative h-full">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {/* Loading Overlay */}
                {generationMutation.isPending && (
                    <AnimatedContainer animation="fade-in-up" delay={0}>
                        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4 rounded-lg">
                            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Generating Proposal</h3>
                                <p className="text-muted-foreground">{t('builder.proposalGenerator.toasts.generatingDesc')}</p>
                            </div>
                            <EnhancedProgress
                                value={75}
                                variant="gradient"
                                indicatorVariant="shimmer"
                                size="lg"
                                className="w-64"
                            />
                        </div>
                    </AnimatedContainer>
                )}

                {/* Collapsed Panel Button */}
                {isPanelCollapsed && (
                    <AnimatedContainer animation="fade-in-left" delay={0}>
                        <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
                            <Card variant="glass" className="p-2 backdrop-blur-md">
                                <Button
                                    variant="secondary"
                                    className="h-auto p-3 rounded-lg w-full flex flex-col items-center gap-2 hover:shadow-glow transition-all duration-200"
                                    onClick={() => setIsPanelCollapsed(false)}
                                >
                                    <PanelRightOpen className="h-5 w-5" />
                                    <span className="text-xs font-medium text-center">
                                        {t('builder.proposalGenerator.toolsTitle')}
                                    </span>
                                </Button>
                            </Card>
                        </div>
                    </AnimatedContainer>
                )}

                {/* Tools Panel */}
                <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                    <AnimatedContainer animation="fade-in-up" delay={200}>
                        <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold font-headline">Generation Tools</CardTitle>
                                        <CardDescription className="text-sm">Configure your proposal</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <ProposalGenerationTools isDisabled={generationMutation.isPending || translateMutation.isPending} />
                            </CardContent>
                        </Card>
                    </AnimatedContainer>
                </div>


                {/* Main Content */}
                <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Card variant="glass" className="h-full flex flex-col overflow-hidden backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="lg:hidden hover:shadow-soft transition-all duration-200" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
                                            {isPanelCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                                        </Button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                                    <FileText className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="font-headline text-xl sm:text-2xl text-primary truncate" title={proposal?.title || "Generated Proposal"}>
                                                        {proposal?.title || "Generated Proposal"}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {proposal?.category || "Review the generated proposal"}
                                                    </CardDescription>
                                                </div>
                                            </div>
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
                                <div className="flex justify-between items-center px-4 py-3 border-y bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm">
                                    <div className="flex-1">
                                        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-background/50 to-primary/5">
                                            <TabsTrigger
                                                value="formatted"
                                                className="gap-2 transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:shadow-glow data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"
                                            >
                                                <File className="h-4 w-4" />
                                                <span className="hidden sm:inline">Formatted</span>
                                                <span className="sm:hidden">View</span>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="markdown"
                                                className="gap-2 transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:shadow-glow data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"
                                            >
                                                <Code className="h-4 w-4" />
                                                <span className="hidden sm:inline">Markdown</span>
                                                <span className="sm:hidden">Code</span>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                    {viewMode === 'formatted' && totalPages > 1 && (
                                        <div className="flex items-center justify-center flex-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                            <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost" size="sm">
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium text-muted-foreground mx-4">
                                                Page {currentPage + 1} of {totalPages}
                                            </span>
                                            <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost" size="sm">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex-1 flex justify-end">
                                        {viewMode === 'formatted' && (
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                                                <span className="text-sm font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
                                                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                    </div>
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
                                                        <FormattedProposalView
                                                            proposal={proposal}
                                                            currentPage={currentPage}
                                                            onUpdate={handleProposalUpdate}
                                                        />
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
                    </AnimatedContainer>
                </div>

            </div>
        </div>
    );
}
