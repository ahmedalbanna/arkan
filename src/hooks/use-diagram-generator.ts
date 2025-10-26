
'use client';

import { type DiagramType, DiagramTypeSchema } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useAgents, useUpdateDiagram } from '@/hooks';
import { useMemo, useState } from 'react';
import { Agent, AgentCategory } from '@/lib/models/agent';


export const useDiagramGenerator = () => {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents } = useAgents();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

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
        if (!agents) return {};
        return agents
            .filter(a => a.category === AgentCategory.DiagramGeneration)
            .reduce((acc, agent) => {
                const sectionId = agent.id.replace('generate-', '').replace('-diagram', '');
                acc[sectionId] = agent;
                return acc;
            }, {} as Record<string, Agent>);
    }, [agents]);

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
        isPanelCollapsed,
        setIsPanelCollapsed,
        diagrams,
        diagramSections,
        mutation,
        handleUpdateDiagram,
        generatedDiagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
    };
};
