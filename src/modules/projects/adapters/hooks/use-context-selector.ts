
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/modules/projects/adapters/state/useBuilderStore';
import { useMemo, useCallback } from 'react';
import { type SectionContext, type ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';

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
            .filter(section => section.id !== itemKey)
            .map(section => ({ id: section.id, title: section.title }));
    }, [project?.sections, itemKey]);
    
    const sectionsContent = useMemo(() => {
        if (!project?.sections) return {};
        return project.sections.reduce<Record<string, string>>((acc, currentSection) => {
            acc[currentSection.id] = currentSection.content || '';
            return acc;
        }, {});
    }, [project?.sections]);


    const handleContextChange = useCallback((
        sectionId: string,
        type: 'sections' | 'externalContext',
        subKey: string,
        value: ExternalContextType | false
    ) => {
        updateProject(currentProject => currentProject.updateSection(sectionId, (sec) => {
            const existingContext = sec.context || { sections: {}, externalContext: {} };
            const newContext = { ...existingContext };
            const newDict = { ...(newContext[type] || {}) };

            if (value === false) {
                delete newDict[subKey];
            } else {
                newDict[subKey] = value;
            }

            newContext[type] = newDict;
            return sec.withProps({ context: newContext });
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
