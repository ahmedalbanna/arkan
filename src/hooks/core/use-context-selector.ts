
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useGenerationUIStore } from '@/hooks/core/useGenerationUIStore';
import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import { useAgents } from '@/hooks/data/useAgents';
import { useSections } from '@/hooks/data/use-sections';
import { useMemo } from 'react';
import { SectionName } from '@/ai/schemas';

export function useContextSelector(itemKey: string) {
    const { t } = useLocalization();
    const { project } = useBuilderStore();
    const { data: allSections } = useSections();
    const { contextSelection, toggleContextSelection, initializeContext } = useGenerationUIStore();

    if (!contextSelection[itemKey]) {
        initializeContext(itemKey);
    }

    const currentSelection = contextSelection[itemKey] || { sections: {}, diagrams: {}, externalContext: [] };
    
    const reportSections = useMemo(() => {
        return (allSections || []).filter(s => s.type === 'report' && s.id !== itemKey);
    }, [allSections, itemKey]);

    return {
        t,
        reportSections,
        toggleContextSelection,
        currentSelection,
        sections: project?.sections || {},
        externalContext: project?.externalContext || [],
    };
}
