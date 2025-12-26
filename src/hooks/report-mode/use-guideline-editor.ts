'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useEffect, useMemo, useState } from 'react';
import { useBuilderStore } from '../core/useBuilderStore';

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    // Local state for UI
    const [rules, setRules] = useState<string[]>([]);
    const [guidelines, setGuidelines] = useState<string[]>([]);
    const [contextPrompt, setContextPrompt] = useState<string[]>([]);
    const [constraints, setConstraints] = useState<string[]>([]);

    // Sync local state when the underlying section in the project store changes
    useEffect(() => {
        if (section) {
            setRules(section.rules || []);
            setGuidelines(section.guidelines || []);
            setContextPrompt(section.contextPrompt || []);
            setConstraints(section.constraints || []);
        }
    }, [section]);

    // Persist changes from the UI back to the global project store after a short delay
    useEffect(() => {
        // Do not run the effect if the section is not yet loaded.
        if (!section) return;

        const handler = setTimeout(() => {
            const currentSection = project?.getSection(itemKey);
            if (!currentSection) return;

            const hasChanged =
                JSON.stringify(currentSection.rules) !== JSON.stringify(rules) ||
                JSON.stringify(currentSection.guidelines) !== JSON.stringify(guidelines) ||
                JSON.stringify(currentSection.contextPrompt) !== JSON.stringify(contextPrompt) ||
                JSON.stringify(currentSection.constraints) !== JSON.stringify(constraints);


            if (hasChanged) {
                updateProject(p => p.updateSection(itemKey, sec => sec.with({
                    rules: rules,
                    guidelines: guidelines,
                    contextPrompt: contextPrompt,
                    constraints: constraints,
                })));
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [rules, guidelines, contextPrompt, constraints, itemKey, project, section, updateProject]);

    
    return {
        t,
        section, // Expose the section so the UI can check for its existence
        rules, setRules,
        guidelines, setGuidelines,
        contextPrompt, setContextPrompt,
        constraints, setConstraints,
    };
}
