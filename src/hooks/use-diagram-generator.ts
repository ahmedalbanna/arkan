'use client';

import { useState, useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useUpdateDiagram } from '@/hooks';
import { type DiagramType } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks'; // NEW: Central store
import { Project } from '@/lib/models/project'; // NEW: Project class

export const useDiagramGenerator = () => {
    const { t, locale } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const { project, setProject } = useBuilderStore(); // NEW: Get project and setProject

    const diagrams = project?.diagrams || {}; // Get diagrams from project

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        if (!project) return; // Ensure project exists
        const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => diagrams[key]?.plantUmlCode === plantUmlCode);
        if (diagramKey) {
            project.setDiagram(diagramKey, { ...diagrams[diagramKey]!, plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
            setProject(project); // Update the central store
        }
    });

    const handleUpdateDiagram = (plantUmlCode: string) => {
        mutation.mutate(plantUmlCode);
    };

    const orderedDiagrams = DiagramTypeSchema.options; // NEW: Get all possible diagram types
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => diagrams?.[key]), [orderedDiagrams, diagrams]);

    // New functions to wrap Project methods and update store
    const handleDiagramCodeUpdate = (key: DiagramType, code: string) => {
        if (!project) return;
        project.updateDiagramCode(key, code);
        setProject(project);
    };

    const setDiagramExplanation = (key: DiagramType, explanation: string) => {
        if (!project) return;
        project.setDiagramExplanation(key, explanation);
        setProject(project);
    };

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        diagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagram,
        generatedDiagrams,
    };
};
