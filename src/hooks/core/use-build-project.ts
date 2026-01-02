
'use client';

import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import type { Project, Section } from '@/lib/models';

export function useBuildProject() {
    const { project } = useBuilderStore();

    const getContextNames = (proj: Project, section: Section): string[] => {
        const context = section.context;
        if (!context) return [];

        const sectionNames = Object.keys(context.sections || {}).map(id => proj.getSection(id)?.title || 'Untitled Section');
        const fileNames = Object.keys(context.externalContext || {}).map(id => proj.externalContext.find(f => f.id === id)?.fileName || 'Untitled File');

        return [...sectionNames, ...fileNames];
    };

    // This can be expanded with more build-related logic
    return { getContextNames };
}
