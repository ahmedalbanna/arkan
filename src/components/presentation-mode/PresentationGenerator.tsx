
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Presentation, PanelRightOpen, PanelLeftClose } from 'lucide-react';
import { PresentationGenerationTools } from './PresentationGenerationTools';
import { lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePresentationGeneratorLogic } from '@/hooks/use-presentation-generator-logic';


function ViewerSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
    );
}

const DynamicPresentationViewer = lazy(() => import('./PresentationViewer'));

export default function PresentationGenerator() {
    const {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        generationMutation,
        translateMutation,
        onGenerate,
        handleTranslateAll,
        activePresentation,
    } = usePresentationGeneratorLogic();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {isPanelCollapsed && (
                <div className="hidden lg:block lg:col-span-1 sticky top-24">
                    <Button variant="secondary" className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180" onClick={() => setIsPanelCollapsed(false)}>
                        <PanelRightOpen className="h-5 w-5 mb-2" />
                        {t('builder.presentationGenerator.toolsTitle')}
                    </Button>
                </div>
            )}
            <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <PresentationGenerationTools
                    isDisabled={generationMutation.isPending || translateMutation.isPending}
                    isGenerating={generationMutation.isPending}
                    onGenerate={onGenerate}
                    onCollapseToggle={() => setIsPanelCollapsed(true)}
                    onTranslateAll={handleTranslateAll}
                    isTranslating={translateMutation.isPending}
                />
            </div>

            <div className={cn("lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                <Suspense fallback={<ViewerSkeleton />}>
                    {activePresentation ? (
                        <DynamicPresentationViewer
                            key={activePresentation.id}
                            activePresentation={activePresentation}
                        />
                    ) : (
                        <Card className="flex items-center justify-center h-full min-h-[300px]">
                            <div className="text-center text-muted-foreground p-8">
                                <Presentation className="w-16 h-16 mx-auto mb-4" />
                                <p>{t('builder.presentationGenerator.viewerEmpty')}</p>
                                {generationMutation.isPending && <Loader2 className="h-8 w-8 animate-spin mt-4 mx-auto" />}
                            </div>
                        </Card>
                    )}
                </Suspense>
            </div>
        </div>
    );
}
