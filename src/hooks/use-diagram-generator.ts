
'use client';

import { type DiagramType, DiagramTypeSchema } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgentStore, useBuilderStore, useSections, useUpdateDiagram } from '@/hooks';
import { useMemo, useState } from 'react';

export const useDiagramGenerator = () => {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { data: sectionConfigs } = useSections();
    const getIconComponent = useAgentStore(state => state.getIconComponent);

    const diagrams = project?.diagrams || {};

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        if (!project) return;
        const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => diagrams[key]?.plantUmlCode === plantUmlCode);
        if (diagramKey) {
            updateProject(p => {
                p.setDiagram(diagramKey, { ...data, explanation: '' }); // Explanation should be cleared on code update
            });
        }
    });

    const diagramSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'diagram').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const handleUpdateDiagram = (plantUmlCode: string) => {
        mutation.mutate(plantUmlCode);
    };

    const orderedDiagrams = DiagramTypeSchema.options;
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => diagrams?.[key]), [orderedDiagrams, diagrams]);

    const handleDiagramCodeUpdate = (key: DiagramType, code: string) => {
        updateProject(p => {
            p.updateDiagramCode(key, code);
        });
    };

    const setDiagramExplanation = (key: DiagramType, explanation: string) => {
        updateProject(p => {
            p.setDiagramExplanation(key, explanation);
        });
    };

    return {
        t,
        locale,
        diagramSections, // This is now safely memoized
        getIconComponent,
        diagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagram,
        generatedDiagrams,
    };
};
