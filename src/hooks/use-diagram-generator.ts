'use client';

import { useState, useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useUpdateDiagram, useSections, useAgentStore } from '@/hooks';
import { type DiagramType, DiagramTypeSchema } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';
import { Project } from '@/lib/models/project';

export const useDiagramGenerator = () => {
    const { t, locale } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const { project, setProject } = useBuilderStore();
    const { data: sectionConfigs, isLoaded: sectionsLoaded } = useSections();
    const getIconComponent = useAgentStore(state => state.getIconComponent);

    const diagrams = project?.diagrams || {};

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        if (!project) return;
        const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => diagrams[key]?.plantUmlCode === plantUmlCode);
        if (diagramKey) {
            project.setDiagram(diagramKey, { ...diagrams[diagramKey]!, plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
            setProject(new Project(project.toStateObject()));
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
        if (!project) return;
        project.updateDiagramCode(key, code);
        setProject(new Project(project.toStateObject()));
    };

    const setDiagramExplanation = (key: DiagramType, explanation: string) => {
        if (!project) return;
        project.setDiagramExplanation(key, explanation);
        setProject(new Project(project.toStateObject()));
    };

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
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
