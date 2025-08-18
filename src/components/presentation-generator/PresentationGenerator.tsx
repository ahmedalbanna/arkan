

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Presentation, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { PresentationGenerationTools } from './PresentationGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { lazy, Suspense, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { Skeleton } from '../ui/skeleton';
import { useGeneratePresentation } from '@/hooks/use-presentation-generation';
import { translatePresentationApi } from '@/services/translation-service';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type { PresentationHistoryEntry } from '@/ai/schemas';
import { Button } from '../ui/button';


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
    const { t, locale } = useLocalization();
    const { firebaseUser } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const {
        presentation,
        activePresentationId,
        replacePresentationInHistory
    } = usePresentationStore();

    const generationMutation = useGeneratePresentation();

    const translateMutation = useMutation({
        mutationFn: translatePresentationApi,
        onSuccess: (data) => {
            replacePresentationInHistory(data);
            toast({
                title: t('builder.presentationGenerator.toasts.translateAllSuccess'),
                description: t('builder.presentationGenerator.toasts.translateAllSuccessDesc'),
            });
        },
        onError: (error: Error) => {
             toast({
                title: t('builder.presentationGenerator.toasts.translateAllFailed'),
                description: error.message || t('builder.presentationGenerator.toasts.translateAllFailedDesc'),
                variant: 'destructive'
            });
        }
    });

    const onGenerate = async (body: any) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: t('builder.presentationGenerator.toasts.authError'), variant: "destructive" });
            return;
        }
        const token = await firebaseUser.getIdToken();
        generationMutation.mutate({ body, token });
    };

    const handleTranslateAll = async (targetLang: 'en' | 'ar') => {
        const activePresentation = presentation?.history.find(p => p.id === activePresentationId);
        if (!activePresentation || !firebaseUser) return;
    
        toast({
            title: t('builder.presentationGenerator.toasts.translateAllStarted'),
            description: t('builder.presentationGenerator.toasts.translateAllStartedDesc'),
        });
    
        const token = await firebaseUser.getIdToken();
        translateMutation.mutate({ presentation: activePresentation, targetLang, token });
    };

    const activePresentation = presentation?.history.find(p => p.id === activePresentationId);

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 -left-2 z-10 hidden lg:inline-flex"
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            >
                {isPanelCollapsed ? <PanelRightOpen /> : <PanelLeftOpen />}
            </Button>
            <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <PresentationGenerationTools
                    isDisabled={generationMutation.isPending || translateMutation.isPending}
                    isGenerating={generationMutation.isPending}
                    onGenerate={onGenerate}
                />
            </div>

            <div className={cn("lg:col-span-8 lg:overflow-y-auto lg:pr-2", isPanelCollapsed && "lg:col-span-12")}>
                <Suspense fallback={<ViewerSkeleton />}>
                    {activePresentation ? (
                        <DynamicPresentationViewer
                            key={activePresentation.id}
                            activePresentation={activePresentation}
                            onTranslateAll={handleTranslateAll}
                            isTranslating={translateMutation.isPending}
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
