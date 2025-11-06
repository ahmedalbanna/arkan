
'use client';

import { useState, useMemo } from 'react';
import type { SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';

export const useSectionLogic = (
    sectionKey: SectionName,
    content: string,
    onUpdate: (key: SectionName, value: string) => void
) => {
    const { t } = useLocalization();

    const words = useMemo(() => content?.split(/\s+/).filter(Boolean).length || 0, [content]);
    const chars = useMemo(() => content?.length || 0, [content]);

    return {
        t,
        words,
        chars,
    };
};
