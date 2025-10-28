'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useTranslate, useGenerateReportSection } from '@/hooks';
import { toast } from '@/hooks';
import type { SectionName, DiagramType, AgentPrompt } from '@/ai/schemas';
import { useBuilderStore } from '@/hooks';
import { Project } from '@/lib/models/project';
import { useExport } from './use-export';
import { useAgents } from './use-agents';
import { AgentCategory } from '@/lib/models/agent';
import { Section } from '@/lib/models/section';
import { useAuth } from '@/context/AuthContext';
import { useGenerationUIStore } from './useGenerationUIStore';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { useSections } from './use-sections';

export const useReportModeGenerator = ({ orderedSections, setOrderedSections }: { orderedSections: Section[], setOrderedSections: (sections: Section[]) => void; }) => {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: sectionConfigs, isLoaded: sectionsLoaded } = useSections();
    
    const reportAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter(a => a.category === AgentCategory.ReportGeneration);
    }, [agents]);

    const sections = project?.sections || {};

    const generatedSections = useMemo(
        () => (orderedSections || []).filter(section => sections[section.id as SectionName]),
        [sections, orderedSections]
    );

    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);
    const { initializeDependentStates,guidelineState, controlState, contextSelection } = useGenerationUIStore();

    const reportGenerationMutation = useGenerateReportSection();
    const isAnythingGenerating = reportGenerationMutation.isPending;

    const onGenerateSection = async (sectionId: SectionName) => {
        if (!project) return;
        const sectionConfig = sectionConfigs?.find(s => s.id === sectionId);
        const agent = agents.find(a => a.id === sectionConfig?.agentId);
        
        if (!agent) {
            toast({ title: "Error", description: `Configuration for agent ${sectionConfig?.agentId} not found.`, variant: "destructive" });
            return;
        }

        const selectedContext = contextSelection[sectionId] || {};
        const controls = controlState[sectionId] || {};
        const outputStyles = Object.entries(controls.outputStyle || {})
            .filter(([, checked]) => checked)
            .map(([style]) => style)
            .join(', ');
        
        const otherSectionsPayload = Object.keys(selectedContext.sections || {})
            .filter(key => selectedContext.sections[key])
            .reduce((obj, key) => ({ ...obj, [key]: project.sections?.[key as SectionName] }), {});
        
        // Ensure the prompt is a plain object before sending
        const plainPrompt = typeof agent.prompt === 'object' ? { ...agent.prompt } : agent.prompt;

        const body = {
            sectionToGenerate: sectionId,
            agentId: agent.id,
            agentPrompt: plainPrompt,
            model: agent.model,
            otherSections: otherSectionsPayload,
            otherDiagrams: Object.keys(selectedContext.diagrams || {})
                .filter(key => selectedContext.diagrams[key])
                .reduce((obj, key) => ({ ...obj, [key]: project.diagrams?.[key as DiagramType]?.plantUmlCode }), {}),
            externalContext: (project.externalContext || []).filter((_, index) => selectedContext.externalContext?.[index]),
            guidelines: getSelectedGuidelines(agent, guidelineState[sectionId]),
            instructionText: `Tone: ${controls.tone}. Formality: ${controls.formality / 100}. Complexity: ${controls.complexity / 100}. Word Count: approx ${controls.wordCount || 300}. Output Format: ${outputStyles || 'paragraph'}.`,
        };

        setActiveMutationKey(sectionId);
        reportGenerationMutation.mutate({ body });
    };

    const hasCreditsForSingleSection = useMemo(() => (userProfile ? userProfile.credits ?? 0 >= 1 : false), [userProfile]);

    useEffect(() => {
        if (agentsLoaded && agents.length > 0 && orderedSections.length > 0) {
            initializeDependentStates(agents, orderedSections);
        }
    }, [agentsLoaded, agents, orderedSections, initializeDependentStates]);

    useEffect(() => {
        if (!orderedSections.length && agentsLoaded && sectionConfigs) {
            const initialOrder = sectionConfigs
                .filter(s => s.type === 'report')
                .map(s => new Section(s));
            setOrderedSections(initialOrder);
        }
    }, [orderedSections.length, setOrderedSections, agents, agentsLoaded, sectionConfigs]);


    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        generatedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agents: reportAgents,
        agentsLoaded
    };
};
