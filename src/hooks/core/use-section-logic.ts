
'use client';

import { useState, useMemo } from 'react';
import { useWritingTool, useTextToSpeech, useToast } from '@/hooks';
import type { SectionName } from '@/ai/schemas';
import { computeDiff, type DiffPart } from '@/lib/diff';
import { useLocalization } from '@/context/LocalizationContext';

export const useSectionLogic = (sectionKey: SectionName, content: string, onUpdate: (key: SectionName, value: string) => void) => {
    const { t } = useLocalization();
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [diff, setDiff] = useState<DiffPart[] | null>(null);
    const { toast } = useToast();

    const aiActionMutation = useWritingTool('/api/writing-tools/manipulate-text', {
        onSuccess: (data: any) => {
            setAiSuggestion(data.rewrittenText);
            setDiff(computeDiff(content, data.rewrittenText));
            toast({ title: t('builder.Section.aiSuggestion') });
        },
        onError: (error) => {
            toast({ title: 'AI Action Failed', description: error.message, variant: 'destructive' });
        }
    });

    const readAloudMutation = useTextToSpeech();

    const handleAiAction = (action: string, payload: any = {}) => {
        const command = payload.selectedText ? `${action}: "${payload.selectedText}"` : action;
        aiActionMutation.mutate({
            textToManipulate: content,
            command: `${command} with style: ${payload.style || 'default'}`
        });
    };

    const handleReadAloud = (textToRead: string) => {
        readAloudMutation.mutate({ text: textToRead }, {
            onSuccess: (data) => {
                const audio = new Audio(data.audioDataUri);
                audio.play();
            }
        });
    };

    const handleAcceptSuggestion = () => {
        if (aiSuggestion) {
            onUpdate(sectionKey, aiSuggestion);
            setAiSuggestion(null);
            setDiff(null);
        }
    };

    const handleRejectSuggestion = () => {
        setAiSuggestion(null);
        setDiff(null);
    };

    const handleClearContent = () => {
        onUpdate(sectionKey, '');
    };

    const wordCount = useMemo(() => content?.split(/\s+/).filter(Boolean).length || 0, [content]);
    const charCount = useMemo(() => content?.length || 0, [content]);

    return {
        aiSuggestion,
        diff,
        t,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        handleAiAction,
        handleReadAloud,
        isProcessingAi: aiActionMutation.isPending,
        isReadingAloud: readAloudMutation.isPending,
        words: wordCount,
        chars: charCount,
        handleClearContent,
    };
};
