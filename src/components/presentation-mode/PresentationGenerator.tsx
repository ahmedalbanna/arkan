

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Presentation } from 'lucide-react';
import { PresentationGenerationTools } from './PresentationGenerationTools';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
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
        generationMutation,
        translateMutation,
        onGenerate,
        handleTranslateAll,
        activePresentation,
    } = usePresentationGeneratorLogic();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
                <PresentationGenerationTools
                    isDisabled={generationMutation.isPending || translateMutation.isPending}
                    isGenerating={generationMutation.isPending}
                    onGenerate={onGenerate}
                />
            </div>

            <div className="lg:col-span-8 lg:overflow-y-auto pr-2">
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
