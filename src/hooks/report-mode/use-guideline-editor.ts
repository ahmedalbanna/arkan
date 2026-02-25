
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useMemo } from 'react';
import { useBuilderStore } from '../core/useBuilderStore';

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    // This hook no longer uses local state that needs to be synced.
    // It directly calls the global `updateProject` function for immutability and consistency.
    // This prevents race conditions and simplifies the data flow.

    const setPrompt = (prompt: string) => {
        updateProject(currentProject => currentProject.updateSection(itemKey, section => section.withProps({ prompt })));
    };

    const setGuidelines = (guidelines: string[]) => {
        updateProject(currentProject => currentProject.updateSection(itemKey, section => section.withProps({ guidelines })));
    };

    return {
        t,
        section, // Expose the section so the UI can check for its existence
        // Directly use section properties in the component
        prompt: section?.prompt || '', setPrompt,
        guidelines: section?.guidelines || [], setGuidelines,
    };
}
