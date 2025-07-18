
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Presentation, AlertCircle, History } from 'lucide-react';
import PresentationViewer from './PresentationViewer';
import { PresentationGenerationTools } from './PresentationGenerationTools';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { lazy } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type { PresentationHistoryEntry, GeneratePresentationOutput } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

const DynamicPresentationViewer = lazy(() => import('./PresentationViewer'));

async function generatePresentation(variables: { body: any, token: string }): Promise<GeneratePresentationOutput> {
    const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify(variables.body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate presentation');
    }
    return response.json();
}

export default function PresentationGenerator() {
    const { t } = useLocalization();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const {
        proposal,
        presentation,
        activePresentationId,
        addPresentationToHistory,
        setActivePresentationId,
    } = useBuilderStore();

    const mutation = useMutation({
        mutationFn: generatePresentation,
        onSuccess: (data) => {
            const newEntry: PresentationHistoryEntry = {
                id: new Date().toISOString(),
                name: `Presentation - ${new Date().toLocaleTimeString()}`,
                slides: data.slides,
            };
            addPresentationToHistory(newEntry);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast({ title: t('builder.presentationGenerator.toasts.success') });
        },
        onError: (error: Error) => {
            toast({ title: t('builder.presentationGenerator.toasts.failed'), description: error.message, variant: 'destructive' });
        }
    });

    const onGenerate = async (body: any) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), description: t('builder.presentationGenerator.toasts.authError'), variant: "destructive" });
            return;
        }
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ body, token });
    };

    if (!proposal) {
        return (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground p-8">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                    <h3 className="text-lg font-semibold">{t('builder.presentationGenerator.noProposal')}</h3>
                    <p>{t('builder.presentationGenerator.noProposalDesc')}</p>
                </div>
            </Card>
        )
    }

    const presentations = presentation?.history || [];
    const activePresentation = presentations.find(p => p.id === activePresentationId);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <History className="w-6 h-6" />
                           {t('builder.presentationGenerator.historyTitle')}
                        </CardTitle>
                        <CardDescription>{t('builder.presentationGenerator.historyDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                             {presentations.length > 0 ? (
                                <div className="space-y-2">
                                    {presentations.map(p => {
                                         const isValidDate = p.id && !isNaN(new Date(p.id).getTime());
                                         return (
                                             <Button
                                                 key={p.id}
                                                 variant="ghost"
                                                 onClick={() => setActivePresentationId(p.id)}
                                                 className={cn(
                                                     "w-full h-auto justify-start text-left p-2",
                                                     activePresentation?.id === p.id && "bg-muted"
                                                 )}
                                             >
                                                 <div className="flex flex-col">
                                                    <span>{p.name} ({t('builder.presentationGenerator.historyItem', { slideCount: (p.slides || []).length })})</span>
                                                    {isValidDate && (
                                                         <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(p.id), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                 </div>
                                             </Button>
                                         )
                                    })}
                                </div>
                             ) : (
                                <p className="text-sm text-muted-foreground text-center">{t('builder.presentationGenerator.historyEmpty')}</p>
                             )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>


            {/* Center Column */}
            <div className="lg:col-span-5 overflow-y-auto pr-2">
                {activePresentation?.slides && activePresentation.slides.length > 0 ? (
                    <DynamicPresentationViewer
                        key={activePresentation.id}
                        slides={activePresentation.slides}
                    />
                ) : (
                    <Card className="flex items-center justify-center h-full min-h-[300px]">
                        <div className="text-center text-muted-foreground p-8">
                            <Presentation className="w-16 h-16 mx-auto mb-4" />
                            <p>{t('builder.presentationGenerator.viewerEmpty')}</p>
                            {mutation.isPending && <Loader2 className="h-8 w-8 animate-spin mt-4 mx-auto" />}
                        </div>
                    </Card>
                )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
                <PresentationGenerationTools
                    isDisabled={!proposal || mutation.isPending}
                    isGenerating={mutation.isPending}
                    onGenerate={onGenerate}
                />
            </div>
        </div>
    );
}
