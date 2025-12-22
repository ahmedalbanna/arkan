

'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import { useMemo, useCallback } from 'react';
import type { SectionContext } from '@/lib/models';

export function useContextSelector(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    const currentSelection = useMemo(() => {
        return section?.context || { sections: {}, externalContext: {} };
    }, [section?.context]);

    const reportSections = useMemo(() => {
        if (!project?.sections) return [];
        return project.sections
            .filter(s => s.id !== itemKey)
            .map(s => ({ id: s.id, title: s.title }));
    }, [project?.sections, itemKey]);
    
    const sectionsContent = useMemo(() => {
        if (!project?.sections) return {};
        return project.sections.reduce((acc, section) => {
            acc[section.id] = section.content || '';
            return acc;
        }, {} as Record<string, string>);
    }, [project?.sections]);


    const toggleContextSelection = useCallback((
        sectionId: string,
        type: keyof Omit<SectionContext, 'diagrams'>,
        subKey: string,
        checked: boolean
    ) => {
        updateProject(p => p.updateSection(sectionId, (sec) => {
            const newContext = { ...sec.context };
            const newDict = { ...(newContext[type] || {}) };
            newDict[subKey] = checked;
            newContext[type] = newDict;
            return sec.with({ context: newContext });
        }));
    }, [updateProject]);

    return {
        t,
        reportSections,
        toggleContextSelection,
        currentSelection,
        sections: sectionsContent,
        externalContext: project?.externalContext || [],
    };
}
