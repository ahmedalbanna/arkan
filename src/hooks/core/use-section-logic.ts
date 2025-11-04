
'use client';

import { useState, useMemo } from 'react';
import type { SectionName } from '@/ai/schemas';
import { computeDiff, type DiffPart } from '@/lib/utils/diff';
import { useLocalization } from '@/context/LocalizationContext';

export const useSectionLogic = (
    sectionKey: SectionName,
    content: string,
    onUpdate: (key: SectionName, value: string) => void
) => {
    const { t } = useLocalization();
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [diff, setDiff] = useState<DiffPart[] | null>(null);

    const handleSuggestion = (newContent: string) => {
        setAiSuggestion(newContent);
        setDiff(computeDiff(content, newContent));
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

    const words = useMemo(() => content?.split(/\s+/).filter(Boolean).length || 0, [content]);
    const chars = useMemo(() => content?.length || 0, [content]);

    return {
        aiSuggestion,
        diff,
        t,
        handleSuggestion,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        words,
        chars,
    };
};
