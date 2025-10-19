

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useProposalModeGeneratorLogic } from '@/hooks';
import { Code, FileText, Loader2, Sparkles } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { ProposalActions } from './ProposalActions';
import { ProposalGenerationTools } from './ProposalGenerationTools';

const MarkdownProposalView = lazy(() => import('./MarkdownProposalView'));

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
        markdownContent,
    } = useProposalModeGeneratorLogic();

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

                {/* Tools Panel */}
                <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
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
                <div className="lg:col-span-8 lg:overflow-y-auto pr-2">
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Card variant="glass" className="h-full flex flex-col overflow-hidden backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                                    <Code className="h-5 w-5 text-white" />
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
                            <CardContent className="flex-1 p-0 bg-slate-200 dark:bg-slate-900/50">
                                <ScrollArea className="h-full p-4">
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
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </AnimatedContainer>
                </div>
            </div>
        </div>
    );
}
