
'use client';

import { type DiagramType, DiagramTypeSchema } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore, useUpdateDiagram } from '@/hooks';
import { Agent, AgentCategory } from '@/lib/models/agent';
import { useMemo } from 'react';

export const useDiagramGenerator = () => {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents } = useAgents();

    // Get the plain data object for reading/displaying in the UI.
    const diagrams = project?.diagrams.toJSON() || {};

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        if (!project) return;
        
        updateProject(p => {
            if (!p) return; // Defensive check
            // Find the diagram key associated with the given plantUmlCode.
            const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => 
                diagrams[key]?.plantUmlCode === plantUmlCode
            );

            if (diagramKey) {
                const existingDiagram = p.diagrams.getDiagram(diagramKey);
                if (existingDiagram) {
                    const currentState = existingDiagram.toStateObject();
                    // Use the manager to update the diagram with the new SVG data.
                    p.diagrams.updateDiagram(diagramKey, { 
                        ...currentState, 
                        ...data, // This likely contains the new SVG
                        explanation: '' // Clear explanation on SVG update, as per original logic
                    });
                }
            }
        });
    });

    const diagramAgents = useMemo(() => {
        if (!agents) return {};
        return agents
            .filter(a => a.category === AgentCategory.DiagramGeneration)
            .reduce((acc, agent) => {
                // Extract the diagram type from the agent ID (e.g., 'generate-use-case-diagram' -> 'use-case')
                const type = agent.id.replace('generate-', '').replace('-diagram', '') as DiagramType;
                acc[type] = agent;
                return acc;
            }, {} as Record<DiagramType, Agent>);
    }, [agents]);

    const handleUpdateDiagramSvg = (plantUmlCode: string) => {
        mutation.mutate(plantUmlCode);
    };

    const orderedDiagrams = DiagramTypeSchema.options;
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => diagrams[key]), [orderedDiagrams, diagrams]);

    const handleDiagramCodeUpdate = (key: DiagramType, code: string) => {
        updateProject(p => {
            if (!p) return; // Defensive check
            const existingDiagram = p.diagrams.getDiagram(key);
            if (existingDiagram) {
                const currentState = existingDiagram.toStateObject();
                // Use the manager to update the diagram with the new code.
                p.diagrams.updateDiagram(key, { ...currentState, plantUmlCode: code });
            }
        });
    };

    const setDiagramExplanation = (key: DiagramType, explanation: string) => {
        updateProject(p => {
            if (!p) return; // Defensive check
            const existingDiagram = p.diagrams.getDiagram(key);
            if (existingDiagram) {
                const currentState = existingDiagram.toStateObject();
                // Use the manager to update the diagram with the new explanation.
                p.diagrams.updateDiagram(key, { ...currentState, explanation: explanation });
            }
        });
    };

    return {
        t,
        locale,
        diagramAgents,
        diagrams, // This is the plain data object for the UI
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagramSvg,
        generatedDiagrams,
    };
};
