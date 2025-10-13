

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePresentationGeneratorLogic } from '@/hooks/use-presentation-generator-logic';
import { Loader2, Presentation, Sparkles } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { PresentationGenerationTools } from './PresentationGenerationTools';


function ViewerSkeleton() {
    return (
        <AnimatedContainer animation="fade-in-up" delay={0}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                            <Presentation className="h-5 w-5 text-white" />
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
                <CardContent className="space-y-4">
                    <Skeleton className="aspect-video w-full rounded-lg bg-gradient-to-r from-muted to-muted/80" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-gradient-to-r from-muted to-muted/80" />
                        <Skeleton className="h-4 w-5/6 bg-gradient-to-r from-muted to-muted/80" />
                        <Skeleton className="h-4 w-4/6 bg-gradient-to-r from-muted to-muted/80" />
                    </div>
                    <EnhancedProgress
                        value={75}
                        variant="gradient"
                        indicatorVariant="shimmer"
                        size="lg"
                        className="mt-4 shadow-soft"
                    />
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
}

const DynamicPresentationViewer = lazy(() => import('./PresentationViewer'));

export default function PresentationGenerator() {
    const {
        t,
        locale,
        generationMutation,
        translateMutation,
        onGenerate,
        handleTranslateAll,
        activePresentation,
    } = usePresentationGeneratorLogic();

    return (
        <div className="relative h-full">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-float animation-delay-2000 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-float animation-delay-4000 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {/* Tools Panel */}
                <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
                    <AnimatedContainer animation="fade-in-up" delay={200}>
                        <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow">
                            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-headline">Presentation Tools</CardTitle>
                                        <CardDescription className="text-sm">Configure your presentation</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <PresentationGenerationTools
                                    isDisabled={generationMutation.isPending || translateMutation.isPending}
                                    isGenerating={generationMutation.isPending}
                                    onGenerate={onGenerate}
                                />
                            </CardContent>
                        </Card>
                    </AnimatedContainer>
                </div>


                {/* Main Content */}
                <div className="lg:col-span-8 lg:overflow-y-auto pr-2">
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Card variant="glass" className="h-full backdrop-blur-md shadow-soft hover:shadow-glow">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                                        <Presentation className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-headline">Presentation Generator</CardTitle>
                                        <CardDescription className="text-sm">AI-powered presentation creation</CardDescription>
                                    </div>
                                    {activePresentation && (
                                        <Badge variant="secondary" className="shadow-soft">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Generated
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="h-full">
                                <Suspense fallback={<ViewerSkeleton />}>
                                    {activePresentation ? (
                                        <DynamicPresentationViewer
                                            key={activePresentation.id}
                                            activePresentation={activePresentation}
                                            isGenerating={generationMutation.isPending}
                                            isTranslating={translateMutation.isPending}
                                            onTranslateAll={handleTranslateAll}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full min-h-[300px]">
                                            <div className="text-center p-8">
                                                <AnimatedContainer animation="fade-in-up" delay={100}>
                                                    <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-600 shadow-soft mb-4">
                                                        <Presentation className="w-8 h-8 text-white" />
                                                    </div>
                                                </AnimatedContainer>
                                                <AnimatedContainer animation="fade-in-up" delay={200}>
                                                    <h3 className="text-lg font-semibold mb-2 font-headline">No Presentation Generated</h3>
                                                </AnimatedContainer>
                                                <AnimatedContainer animation="fade-in-up" delay={300}>
                                                    <p className="text-muted-foreground mb-4">{t('builder.presentationGenerator.viewerEmpty')}</p>
                                                </AnimatedContainer>
                                                {generationMutation.isPending && (
                                                    <AnimatedContainer animation="fade-in-up" delay={400}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span className="text-sm">Generating...</span>
                                                        </div>
                                                    </AnimatedContainer>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Suspense>
                            </CardContent>
                        </Card>
                    </AnimatedContainer>
                </div>

            </div>
        </div>
    );
}
