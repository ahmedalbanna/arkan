'use client';

import { useState, useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
// OLD: import { useSectionStore } from '@/hooks';
// OLD: import { useDiagramStore } from '@/hooks';
import { useUpdateDiagram } from '@/hooks';
import { type DiagramType, DiagramTypeSchema } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks'; // NEW: Central store

export const useDiagramGenerator = () => {
    // OLD: const { diagramSections, getIconComponent } = useSectionStore();
    const { t, locale } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    // OLD: const { diagrams, handleDiagramCodeUpdate, setDiagram, setDiagramExplanation } = useDiagramStore();
    const { project, setProject } = useBuilderStore(); // NEW: Get project and setProject

    const diagrams = project?.diagrams || {}; // Get diagrams from project

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        if (!project) return; // Ensure project exists
        // Find which diagram this mutation was for to update the correct one
        const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => diagrams[key]?.plantUmlCode === plantUmlCode);
        if (diagramKey) {
            project.setDiagram(diagramKey, { ...diagrams[diagramKey]!, plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
            setProject(project); // Update the central store
        }
    });

    const handleUpdateDiagram = (plantUmlCode: string) => {
        mutation.mutate(plantUmlCode);
    };

    // OLD: const orderedDiagrams = useMemo(() => Object.keys(diagramSections) as DiagramType[], [diagramSections]);
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
        // OLD: diagramSections,
        // OLD: getIconComponent,
        diagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagram,
        generatedDiagrams,
    };
};