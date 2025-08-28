
// code explantion in docs/hooks/use-report-generation-logic.md

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useReportStore } from '@/hooks';
import { useDiagramStore } from '@/hooks';
import { useProjectPlanStore } from '@/hooks';
import { useSectionStore } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { useGenerateReportSection, useGenerateFullReport } from '@/hooks';
import { evaluateContextApi } from '@/services';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { SectionNameSchema, type SectionName as SectionNameType, type DiagramType, EvaluateContextOutput } from '@/ai/schemas';
import { useAgents } from './use-agents';
import { useReportTemplates } from './use-templates';
import { AgentPrompt } from '@/lib/types';

const orderedSections = SectionNameSchema.options;

// Helper function to generate instruction text from control state
const generateInstructionText = (controls: any): string => {
    let instructions = [];
    let formalityDesc = "balanced";
    if (controls.formality < 33) formalityDesc = "informal";
    else if (controls.formality > 66) formalityDesc = "very formal";
    instructions.push(`- The writing style should be ${formalityDesc}.`);
    if (controls.tone && controls.tone !== "none") instructions.push(`- Adopt a ${controls.tone} tone.`);
    if (controls.wordCount) instructions.push(`- The response should be approximately ${controls.wordCount} words long.`);
    return instructions.join('\n');
};

export function useReportGenerationLogic() {
    const { toast } = useToast();
    const { userProfile, firebaseUser } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);
    const [generationPlan, setGenerationPlan] = useState<EvaluateContextOutput | null>(null);
    const [isPlanning, setIsPlanning] = useState(false);

    const { reportSections, loading: sectionsLoading } = useSectionStore();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();
    const { diagrams } = useDiagramStore();
    const {
        sections,
        externalContext,
        controlState,
        guidelineState,
        contextSelection,
        selectedReportTemplateId,
        initializeDependentStates,
        setSelectedReportTemplateId,
        initializeContextSelection,
    } = useReportStore();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: reportTemplates, isLoading: templatesLoading } = useReportTemplates();

    const reportGenerationMutation = useGenerateReportSection();
    const fullReportMutation = useGenerateFullReport();

    const isAnythingGenerating = reportGenerationMutation.isPending || fullReportMutation.isPending;

    // Initialize dependent states (guidelines, controls) once agents and sections are loaded.
    useEffect(() => {
        if (agentsLoaded && !sectionsLoading) {
            initializeDependentStates();
        }
    }, [agentsLoaded, sectionsLoading, initializeDependentStates]);

    useEffect(() => {
        if (!selectedReportTemplateId && reportTemplates && reportTemplates.length > 0) {
            setSelectedReportTemplateId(reportTemplates[0].id);
        }
    }, [reportTemplates, selectedReportTemplateId, setSelectedReportTemplateId]);

    useEffect(() => {
        if (agentsLoaded && agents.length > 0) {
            if (Object.keys(reportSections).length === 0) return;
            agents.forEach(agent => {
                const sectionKey = Object.keys(reportSections).find(key => reportSections[key as SectionNameType].agentId === agent.id);
                if (sectionKey) {
                    const prompt = agent.prompt as AgentPrompt;
                    const defaultContext = prompt.defaultContext || [];
                    if (defaultContext.length > 0) {
                        initializeContextSelection(sectionKey, defaultContext);
                    }
                }
            });
        }
    }, [agentsLoaded, agents, initializeContextSelection, reportSections]);

    const onGenerateSection = async (section: SectionNameType) => {
        const fullState = useBuilderStore.getState().getFullState();
        const currentSelection = contextSelection[section] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const exampleFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'example');
        const contextFiles = externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'context');
        const agent = agents?.find(a => a.id === reportSections[section]?.agentId);

        const body = {
            proposal: currentSelection.proposal ? fullState.proposal : undefined,
            projectPlan: currentSelection.projectPlan ? fullState.projectPlan : undefined,
            sectionToGenerate: section,
            otherSections: Object.keys(currentSelection.sections).filter(k => currentSelection.sections[k]).reduce((acc, k) => ({ ...acc, [k]: fullState.sections?.[k as SectionNameType] }), {}),
            otherDiagrams: Object.keys(currentSelection.diagrams).filter(k => currentSelection.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: fullState.diagrams?.[k as DiagramType]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[section]),
            instructionText: generateInstructionText(controlState[section]),
            exampleFiles,
            contextFiles,
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutate({ body });
    };

    const selectedTemplate = useMemo(() => reportTemplates?.find((t) => t.id === selectedReportTemplateId), [reportTemplates, selectedReportTemplateId]);

    const availableSections = useMemo(() => {
        if (!selectedTemplate) return [];
        return orderedSections.filter(key => reportSections[key] && selectedTemplate.sectionIds.includes(key as SectionNameType));
    }, [reportSections, selectedTemplate]);

    const getGenerationPlan = async () => {
        if (!selectedTemplate) {
            toast({ title: "No Template Selected", variant: "destructive" });
            return null;
        }

        const sectionsToGenerate = selectedTemplate.sectionIds
            .filter((sectionId): sectionId is SectionNameType => !!reportSections[sectionId] && !sections[sectionId]);

        if (sectionsToGenerate.length === 0) {
            toast({ title: "Report Complete", description: "All sections for this template have already been generated." });
            return null;
        }

        try {
            const token = await getAuthenticatedToken(firebaseUser);
            const evaluationBody = {
                proposal,
                projectPlan,
                existingSections: sections,
                existingDiagrams: diagrams,
                sectionsToGenerate,
                externalContext,
            };
            return await evaluateContextApi(evaluationBody, token);
        } catch (error: any) {
            toast({ title: "Error Creating Plan", description: error.message, variant: "destructive" });
            return null;
        }
    }

    const handleViewPlan = async () => {
        setIsPlanning(true);
        const plan = await getGenerationPlan();
        if (plan) {
            setGenerationPlan(plan);
        }
        setIsPlanning(false);
    };

    const onGenerateFullReport = async () => {
        setIsPlanning(true);
        const plan = await getGenerationPlan();
        setIsPlanning(false);

        if (plan) {
            setActiveMutationKey('full-report');
            const fullReportBody = {
                proposal,
                projectPlan,
                existingSections: sections,
                existingDiagrams: diagrams,
                externalContext,
                generationPlan: plan.configs,
            };
            fullReportMutation.mutate(fullReportBody);
        }
    };

    const sectionsToGenerateCount = useMemo(() => (selectedTemplate?.sectionIds || [])
        .filter(sectionId => {
            if (Object.keys(reportSections).length === 0) return false;
            return !!reportSections[sectionId] && !sections[sectionId];
        }).length || 0, [selectedTemplate, reportSections, sections]);

    const fullReportCreditCost = sectionsToGenerateCount > 0 ? sectionsToGenerateCount + 1 : 0;

    const canGenerateFullReport = useMemo(() => (
        (!!proposal || !!projectPlan || (externalContext && externalContext.length > 0)) &&
        (userProfile ? userProfile.credits >= fullReportCreditCost : false) &&
        fullReportCreditCost > 1 &&
        !isAnythingGenerating
    ), [proposal, projectPlan, externalContext, userProfile, fullReportCreditCost, isAnythingGenerating]);

    const hasCreditsForSingleSection = useMemo(() => (userProfile ? userProfile.credits >= 1 : false), [userProfile]);

    return {
        isAnythingGenerating,
        isPlanning,
        activeMutationKey,
        generationPlan,
        setGenerationPlan,
        onGenerateSection,
        onGenerateFullReport,
        handleViewPlan,
        availableSections,
        canGenerateFullReport,
        hasCreditsForSingleSection,
        agentsLoaded,
        sectionsLoading,
        templatesLoading,
        reportTemplates,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        fullReportCreditCost,
    };
}
