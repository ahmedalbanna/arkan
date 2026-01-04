
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useMemo } from 'react';
import { useBuilderStore } from '../core/useBuilderStore';
import { Behavior } from '@/lib/models';

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    const setPrompt = (prompt: string) => {
        updateProject(p => p.updateSection(itemKey, s => s.with({ prompt })));
    };

    const setGuidelines = (guidelines: string[]) => {
        updateProject(p => p.updateSection(itemKey, s => s.with({ guidelines })));
    };

    return {
        t,
        section, // Expose the section so the UI can check for its existence
        prompt: section?.prompt || '', setPrompt,
        guidelines: section?.guidelines || [], setGuidelines,
    };
}
