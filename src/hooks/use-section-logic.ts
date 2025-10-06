
// code explantion in docs/hooks/use-section-logic.md

'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import type { ManipulateTextInput, SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { useWritingTool } from '@/hooks/use-writing-tools';
import { computeDiff, DiffPart } from '@/lib/diff';
import { processPlantUml } from '@/lib/utils';
import { manipulateTextApi } from '@/services/generation-service';

// Helper to calculate word and character counts
const calculateCounts = (text: string) => {
    if (!text) return { words: 0, chars: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    return { words, chars };
};

export const useSectionLogic = (sectionKey: SectionName, content: string, onUpdate: (key: SectionName, value: string) => void) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [localContent, setLocalContent] = useState(content);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [diff, setDiff] = useState<DiffPart[] | null>(null);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const { toast } = useToast();
    const { firebaseUser, refetchUser } = useAuth();
    const { t } = useLocalization();
    const ttsMutation = useTextToSpeech();

    const rewriteMutation = useWritingTool('/api/writing-tools/rewrite-text');
    const humanizeMutation = useWritingTool('/api/writing-tools/humanize');

    useEffect(() => {
        setLocalContent(content);
    }, [content]);

    const manipulateMutation = useMutation({
        mutationFn: async (data: ManipulateTextInput) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return manipulateTextApi({ data, token });
        },
        onSuccess: (data) => {
            setAiSuggestion(data.rewrittenText);
            setDiff(computeDiff(content, data.rewrittenText));
            refetchUser();
            toast({ title: t('builder.Section.toasts.suggestionReadyTitle'), description: t('builder.Section.toasts.suggestionReadyDesc') });
        },
        onError: (error: Error) => {
            const isCreditError = error.message.toLowerCase().includes('credit');
            toast({
                title: isCreditError ? t('builder.toasts.insufficientCredits') : t('builder.toasts.generationFailed'),
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const handleRewriteAction = (style: string) => {
        setAiSuggestion(null);
        setDiff(null);
        rewriteMutation.mutate({ text: content, style }, {
            onSuccess: (data: any) => {
                setAiSuggestion(data.rewrittenText);
                setDiff(computeDiff(content, data.rewrittenText));
            },
            onError: (error: any) => toast({ title: t('builder.Section.toasts.rewriteFailed'), description: error.message, variant: "destructive"})
        });
    }

    const handleHumanizeAction = () => {
        setAiSuggestion(null);
        setDiff(null);
        humanizeMutation.mutate({ text: content }, {
            onSuccess: (data: any) => {
                setAiSuggestion(data.humanizedText);
                setDiff(computeDiff(content, data.humanizedText));
            },
            onError: (error: any) => toast({ title: t('builder.Section.toasts.humanizeFailed'), description: error.message, variant: "destructive"})
        });
    }

    const isProcessingAi = manipulateMutation.isPending || ttsMutation.isPending || rewriteMutation.isPending || humanizeMutation.isPending;

    // Effect to play audio when src changes
    useEffect(() => {
        if (audioSrc && showAudioPlayer && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    }, [audioSrc, showAudioPlayer]);


    const handleAiAction = (command: string) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), variant: "destructive" });
            return;
        }
        setAiSuggestion(null);
        setDiff(null);
        const data = { textToManipulate: content, command };
        manipulateMutation.mutate(data);
    };

    const handleReadAloud = () => {
        if (audioSrc) {
            setShowAudioPlayer(true);
            return;
        }
        ttsMutation.mutate({ text: content }, {
            onSuccess: (data) => {
                setAudioSrc(data.audioDataUri);
                setShowAudioPlayer(true);
                toast({ title: t('builder.Section.toasts.ttsSuccessTitle'), description: t('builder.Section.toasts.ttsSuccessDesc')});
            },
        });
    };

    const handleAcceptSuggestion = () => {
        if (aiSuggestion !== null) {
            onUpdate(sectionKey, aiSuggestion);
            setAiSuggestion(null);
            setDiff(null);
        }
    };

    const handleRejectSuggestion = () => {
        setAiSuggestion(null);
        setDiff(null);
    };

    const { words, chars } = calculateCounts(content);
    const processedContent = processPlantUml(content);

    return {
        audioRef,
        localContent,
        setLocalContent,
        aiSuggestion,
        diff,
        showAudioPlayer,
        setShowAudioPlayer,
        audioSrc,
        t,
        isProcessingAi,
        ttsMutation,
        handleRewriteAction,
        handleHumanizeAction,
        handleAiAction,
        handleReadAloud,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        words,
        chars,
        processedContent,
    };
};
