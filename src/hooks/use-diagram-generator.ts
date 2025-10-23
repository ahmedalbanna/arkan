
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

    const diagramsManager = project?.report.diagramsManager;
    const diagrams = diagramsManager?.toJSON() || {};

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        if (!diagramsManager) return;
        
        const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => 
            diagrams[key]?.plantUmlCode === plantUmlCode
        );

        if (diagramKey) {
            updateProject(p => {
                if (!p) return null;
                p.report.diagramsManager.updateDiagram(diagramKey, { 
                    ...data, // Contains the new SVG from the mutation result
                    explanation: '' // Clear explanation on SVG update
                });
                p.setUnsavedChanges(true);
                return p;
            });
        }
    });

    const diagramAgents = useMemo(() => {
        if (!agents) return {};
        const agentsMap = new Map<DiagramType, Agent>();
        agents
            .filter(a => a.category === AgentCategory.DiagramGeneration)
            .forEach(agent => {
                const type = agent.id.replace(/^generate-/, '').replace(/-diagram$/, '') as DiagramType;
                if (!agentsMap.has(type)) {
                    agentsMap.set(type, agent);
                }
            });
        return Object.fromEntries(agentsMap.entries());
    }, [agents]);

    const handleUpdateDiagramSvg = (plantUmlCode: string) => {
        mutation.mutate(plantUmlCode);
    };

    const orderedDiagrams = DiagramTypeSchema.options;
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => diagrams[key]), [orderedDiagrams, diagrams]);

    const handleDiagramCodeUpdate = (key: DiagramType, code: string) => {
        updateProject(p => {
            if (!p) return null;
            p.report.diagramsManager.updateDiagram(key, { plantUmlCode: code });
            p.setUnsavedChanges(true);
            return p;
        });
    };

    const setDiagramExplanation = (key: DiagramType, explanation: string) => {
        updateProject(p => {
            if (!p) return null;
            p.report.diagramsManager.updateDiagram(key, { explanation: explanation });
            p.setUnsavedChanges(true);
            return p;
        });
    };

    return {
        t,
        locale,
        diagramAgents,
        diagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagramSvg,
        generatedDiagrams,
    };
};
