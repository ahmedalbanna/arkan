
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

    const setRules = (rules: string[]) => {
        updateProject(p => p.updateSection(itemKey, s => s.with({ rules })));
    };

    const setGuidelines = (guidelines: string[]) => {
        updateProject(p => p.updateSection(itemKey, s => s.with({ guidelines })));
    };

    const setConstraints = (constraints: string[]) => {
        updateProject(p => p.updateSection(itemKey, s => s.with({ constraints })));
    };

    const setBehaviors = (behaviors: Behavior[]) => {
        updateProject(p => p.updateSection(itemKey, s => s.with({ behaviors })));
    };

    return {
        t,
        section, // Expose the section so the UI can check for its existence
        prompt: section?.prompt || '', setPrompt,
        rules: section?.rules || [], setRules,
        guidelines: section?.guidelines || [], setGuidelines,
        constraints: section?.constraints || [], setConstraints,
        behaviors: section?.behaviors || [], setBehaviors,
    };
}
