
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import { useMemo, useCallback } from 'react';
import type { SectionContext, ExternalContextType } from '@/lib/models';

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


    const handleContextChange = useCallback((
        sectionId: string,
        type: 'sections' | 'externalContext',
        subKey: string,
        value: ExternalContextType | false
    ) => {
        updateProject(p => p.updateSection(sectionId, (sec) => {
            const newContext = { ...sec.context };
            const newDict = { ...(newContext[type] || {}) };
            
            if (value === false) {
                delete newDict[subKey];
            } else {
                newDict[subKey] = value;
            }
            
            newContext[type] = newDict;
            return sec.with({ context: newContext });
        }));
    }, [updateProject]);

    return {
        t,
        reportSections,
        handleContextChange,
        currentSelection,
        sections: sectionsContent,
        externalContext: project?.externalContext || [],
    };
}
