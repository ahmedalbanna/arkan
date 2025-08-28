'use client';

import { useState, useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useSectionStore } from '@/hooks/useSectionStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useUpdateDiagram } from '@/hooks/use-diagrams';
import { type DiagramType } from '@/ai/schemas';

export const useDiagramGenerator = () => {
    const { diagramSections, getIconComponent } = useSectionStore();
    const { t, locale } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

    const {
        diagrams,
        handleDiagramCodeUpdate,
        setDiagram,
        setDiagramExplanation,
    } = useDiagramStore();

    const mutation = useUpdateDiagram((data, plantUmlCode) => {
        // Find which diagram this mutation was for to update the correct one
        const diagramKey = (Object.keys(diagrams) as DiagramType[]).find(key => diagrams[key]?.plantUmlCode === plantUmlCode);
        if (diagramKey) {
            setDiagram(diagramKey, { ...diagrams[diagramKey]!, plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
        }
    });

    const handleUpdateDiagram = (plantUmlCode: string) => {
        mutation.mutate(plantUmlCode);
    };

    const orderedDiagrams = useMemo(() => Object.keys(diagramSections) as DiagramType[], [diagramSections]);
    const generatedDiagrams = useMemo(() => orderedDiagrams.filter(key => diagrams?.[key]), [orderedDiagrams, diagrams]);

    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        diagramSections,
        getIconComponent,
        diagrams,
        handleDiagramCodeUpdate,
        setDiagramExplanation,
        mutation,
        handleUpdateDiagram,
        generatedDiagrams,
    };
};
