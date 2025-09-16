// code explantion in docs/hooks/use-section-logic.md

'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import type { ManipulateTextOutput, ManipulateTextInput, SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useTextToSpeech } from '@/hooks';
import { useWritingTool } from '@/hooks';
import { computeDiff, DiffPart } from '@/lib/diff';
import { processPlantUml } from '@/lib/utils';
import { writingToolApi } from '@/services';


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

    const aiActionMutation = useWritingTool('rewrite-text', {
        onSuccess: (data: any) => {
            const resultText = data.rewrittenText;
            setAiSuggestion(resultText);
            setDiff(computeDiff(content, resultText));
            toast({ title: t('builder.Section.toasts.suggestionReadyTitle'), description: t('builder.Section.toasts.suggestionReadyDesc') });
        },
        onError: (error: any) => {
             const isCreditError = error.message.toLowerCase().includes('credit');
            toast({
                title: isCreditError ? t('builder.toasts.insufficientCredits') : t('builder.toasts.generationFailed'),
                description: error.message,
                variant: "destructive"
            });
        }
    });

    useEffect(() => {
        setLocalContent(content);
    }, [content]);

    const isProcessingAi = aiActionMutation.isPending || ttsMutation.isPending;

    // Effect to play audio when src changes
    useEffect(() => {
        if (audioSrc && showAudioPlayer && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    }, [audioSrc, showAudioPlayer]);


    const handleAiAction = (styleOrCommand: string, isCommand: boolean = true) => {
        if (!firebaseUser) {
            toast({ title: t('builder.toasts.authError'), variant: "destructive" });
            return;
        }
        setAiSuggestion(null);
        setDiff(null);

        const variables = isCommand
            ? { text: content, style: `command: ${styleOrCommand}` }
            : { text: content, style: styleOrCommand };

        aiActionMutation.mutate(variables);
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
        handleAiAction,
        handleReadAloud,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        words,
        chars,
        processedContent,
    };
};
