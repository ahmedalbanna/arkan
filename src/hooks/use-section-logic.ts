

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
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [diff, setDiff] = useState<DiffPart[] | null>(null);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const { toast } = useToast();
    const { t } = useLocalization();
    const ttsMutation = useTextToSpeech();
    const [selection, setSelection] = useState<{ text: string, from: number, to: number } | null>(null);

    const handleSuccess = (data: any) => {
        const resultText = data.rewrittenText || data.summarizedText || data.humanizedText || data.correctedText;
        if (resultText && selection) {
            const originalContent = content;
            const newContent = originalContent.slice(0, selection.from) + resultText + originalContent.slice(selection.to);
            onUpdate(sectionKey, newContent);
            setAiSuggestion(null);
            setDiff(null);
        } else if (resultText) {
            setAiSuggestion(resultText);
            setDiff(computeDiff(content, resultText));
        } else {
             toast({ title: t('builder.Section.toasts.suggestionErrorTitle'), description: t('builder.Section.toasts.suggestionErrorDesc'), variant: "destructive" });
        }
        setSelection(null);
    };
    
    const handleError = (error: any) => {
        const isCreditError = error.message.toLowerCase().includes('credit');
        toast({
            title: isCreditError ? t('builder.toasts.insufficientCredits') : t('builder.toasts.generationFailed'),
            description: error.message,
            variant: "destructive"
        });
        setSelection(null);
    }

    const summarizeMutation = useWritingTool('summarize-with-ratio', { onSuccess: handleSuccess, onError: handleError });
    const expandMutation = useWritingTool('manipulate-text', { onSuccess: handleSuccess, onError: handleError });
    const grammarMutation = useWritingTool('grammar-checker', { onSuccess: handleSuccess, onError: handleError });
    const humanizeMutation = useWritingTool('humanize-text', { onSuccess: handleSuccess, onError: handleError });
    const rewriteMutation = useWritingTool('rewrite-text', { onSuccess: handleSuccess, onError: handleError });

    const isProcessingAi = summarizeMutation.isPending || expandMutation.isPending || grammarMutation.isPending || humanizeMutation.isPending || rewriteMutation.isPending || ttsMutation.isPending;

    useEffect(() => {
        // When content is updated from outside (e.g. accepting a suggestion), clear old suggestions
        setAiSuggestion(null);
        setDiff(null);
    }, [content]);

    // Effect to play audio when src changes
    useEffect(() => {
        if (audioSrc && showAudioPlayer && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    }, [audioSrc, showAudioPlayer]);


    const handleAiAction = (action: string, payload?: any) => {
        const textToProcess = payload?.selectedText || content;
        if (!textToProcess) return;

        // If a selection was made, store its range to replace it later
        if (payload?.selectedText) {
             const from = content.indexOf(payload.selectedText);
             if (from !== -1) {
                setSelection({ text: payload.selectedText, from, to: from + payload.selectedText.length });
             }
        } else {
            setSelection(null);
        }
        
        setAiSuggestion(null);
        setDiff(null);

        switch (action) {
            case 'summarize':
                summarizeMutation.mutate({ text: textToProcess, ratio: 50 }); // Default to 50%
                break;
            case 'expand':
                expandMutation.mutate({ textToManipulate: textToProcess, command: "Expand on this topic, adding more detail and explanation." });
                break;
            case 'grammar':
                grammarMutation.mutate({ text: textToProcess });
                break;
            case 'humanize':
                humanizeMutation.mutate({ text: textToProcess });
                break;
            case 'rewrite':
                if(payload?.style) {
                    rewriteMutation.mutate({ text: textToProcess, style: payload.style });
                }
                break;
            default:
                break;
        }
    };

    const handleReadAloud = () => {
        const text = content;
        if (audioSrc) {
            setShowAudioPlayer(true);
            return;
        }
        ttsMutation.mutate({ text }, {
            onSuccess: (data) => {
                setAudioSrc(data.audioDataUri);
                setShowAudioPlayer(true);
                toast({ title: t('builder.Section.toasts.ttsSuccessTitle'), description: t('builder.Section.toasts.ttsSuccessDesc')});
            },
             onError: (error) => {
                toast({ title: 'Text-to-Speech Failed', description: error.message, variant: 'destructive' });
            }
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
