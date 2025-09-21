

'use client';

import { type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useGenerateReportSection, useToast } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { useMemo, useState } from 'react';
import { useAgents } from './use-agents';
import { useSections } from './use-sections';
import { useGenerationUIStore } from './useGenerationUIStore';

// Helper function to generate instruction text from control state
const generateInstructionText = (controls: any, oneTimeInstruction: string): string => {
    let instructions = [];
    if (oneTimeInstruction) {
        instructions.push(oneTimeInstruction);
    }
    let formalityDesc = "balanced";
    if (controls.formality < 33) formalityDesc = "informal";
    else if (controls.formality > 66) formalityDesc = "very formal";
    instructions.push(`- The writing style should be ${formalityDesc}.`);
    if (controls.tone && controls.tone !== "none") instructions.push(`- Adopt a ${controls.tone} tone.`);
    if (controls.wordCount) instructions.push(`- The response should be approximately ${controls.wordCount} words long.`);
    return instructions.join('\n');
};

export function useReportGenerationLogic() {
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);

    const { project } = useBuilderStore();

    const {
        controlState,
        guidelineState,
        contextSelection,
        oneTimeInstructions,
        initializeDependentStates,
    } = useGenerationUIStore();

    const { data: sectionConfigs, isLoading: sectionsLoading } = useSections();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const reportGenerationMutation = useGenerateReportSection();

    // Initialize dependent states once data is loaded
    useState(() => {
        if (agentsLoaded && !sectionsLoading && sectionConfigs && agents.length > 0) {
            initializeDependentStates(agents, sectionConfigs);
        }
    });


    const isAnythingGenerating = reportGenerationMutation.isPending;

    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const orderedSections = useMemo(() => {
        if (!reportSections || Object.keys(reportSections).length === 0) return [];
        // Sort sections alphabetically by title for a consistent order
        return Object.keys(reportSections).sort((a, b) =>
            reportSections[a].title.localeCompare(reportSections[b].title)
        ) as SectionNameType[];
    }, [reportSections]);


    const onGenerateSection = async (section: SectionNameType) => {
        if (!project || !guidelineState || !controlState) return;
        const currentSelection = contextSelection?.[section] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const exampleFiles = project.externalContext?.filter((c: any, i: number) => currentSelection.externalContext[i] && c.type === 'example');
        const contextFiles = project.externalContext?.filter((c: any, i: number) => currentSelection.externalContext[i] && c.type === 'context');
        const agent = agents?.find(a => a.id === reportSections[section]?.agentId);
        const oneTimeInstruction = oneTimeInstructions[section] || '';

        const body = {
            proposal: currentSelection.proposal ? project.proposal : undefined,
            projectPlan: currentSelection.projectPlan ? project.projectPlan : undefined,
            sectionToGenerate: section,
            otherSections: Object.keys(currentSelection.sections).filter(k => currentSelection.sections[k]).reduce((acc, k) => ({ ...acc, [k]: project.sections?.[k as SectionNameType] }), {}),
            otherDiagrams: Object.keys(currentSelection.diagrams).filter(k => currentSelection.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: project.diagrams?.[k as keyof typeof project.diagrams]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[section]),
            instructionText: generateInstructionText(controlState[section], oneTimeInstruction),
            exampleFiles,
            contextFiles,
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutate({ body });
    };

    const hasCreditsForSingleSection = useMemo(() => (userProfile ? userProfile.credits ?? 0 >= 1 : false), [userProfile]);

    return {
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agentsLoaded,
        sectionsLoading,
        orderedSections,
        project,
    };
}
