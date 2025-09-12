

// code explantion in docs/hooks/use-report-generation-logic.md

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useReportStore } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { useGenerateReportSection, useGenerateFullReport } from '@/hooks';
import { evaluateContextApi } from '@/services';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { SectionNameSchema, type SectionName as SectionNameType, type DiagramType, EvaluateContextOutput } from '@/ai/schemas';
import { useAgents } from './use-agents';
import { useReportTemplates } from './use-templates';
import { AgentPrompt } from '@/lib/types';
import { useSections } from './use-sections';
import { useLocalization } from '@/context/LocalizationContext';

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
    const { t } = useLocalization();
    const { toast } = useToast();
    const { userProfile, firebaseUser } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);
    const [generationPlan, setGenerationPlan] = useState<EvaluateContextOutput | null>(null);
    const [isPlanning, setIsPlanning] = useState(false);
    
    const { project, setProject } = useBuilderStore(); // Get project and setProject
    
    const {
        controlState,
        guidelineState,
        contextSelection,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
    } = useReportStore();
    
    const { data: sectionConfigs, isLoading: sectionsLoading } = useSections();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: reportTemplates, isLoading: templatesLoading } = useReportTemplates();

    const reportGenerationMutation = useGenerateReportSection();
    const fullReportMutation = useGenerateFullReport();

    const isAnythingGenerating = reportGenerationMutation.isPending || fullReportMutation.isPending;

    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    useEffect(() => {
        if (!selectedReportTemplateId && reportTemplates && reportTemplates.length > 0) {
            const defaultTemplate = reportTemplates.find(t => t.isDefault) || reportTemplates[0];
            setSelectedReportTemplateId(defaultTemplate.id);
        }
    }, [reportTemplates, selectedReportTemplateId, setSelectedReportTemplateId]);

    const orderedSections = useMemo(() => {
        if (!reportTemplates || !selectedReportTemplateId || !reportSections) {
            return [];
        }
        const template = reportTemplates.find(t => t.id === selectedReportTemplateId);
        // Ensure template and reportSections are available before filtering
        if (template && Object.keys(reportSections).length > 0) {
            return template.sectionIds.filter(key => reportSections[key as SectionNameType]) as SectionNameType[];
        }
        return [];
    }, [selectedReportTemplateId, reportTemplates, reportSections]);

    const onGenerateSection = async (section: SectionNameType) => {
        if (!project) return;
        const currentSelection = contextSelection[section] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const exampleFiles = project.externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'example');
        const contextFiles = project.externalContext?.filter((c, i) => currentSelection.externalContext[i] && c.type === 'context');
        const agent = agents?.find(a => a.id === reportSections[section]?.agentId);

        const body = {
            proposal: currentSelection.proposal ? project.proposal : undefined,
            projectPlan: currentSelection.projectPlan ? project.projectPlan : undefined,
            sectionToGenerate: section,
            otherSections: Object.keys(currentSelection.sections).filter(k => currentSelection.sections[k]).reduce((acc, k) => ({ ...acc, [k]: project.sections?.[k as SectionNameType] }), {}),
            otherDiagrams: Object.keys(currentSelection.diagrams).filter(k => currentSelection.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: project.diagrams?.[k as DiagramType]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[section]),
            instructionText: generateInstructionText(controlState[section]),
            exampleFiles,
            contextFiles,
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutate({ body });
    };

    const selectedTemplate = useMemo(() => reportTemplates?.find((t) => t.id === selectedReportTemplateId), [reportTemplates, selectedReportTemplateId]);
    
    const sectionsToGenerateCount = useMemo(() => (selectedTemplate?.sectionIds || [])
        .filter(sectionId => {
            if (!project?.sections || Object.keys(reportSections).length === 0) return false;
            return !!reportSections[sectionId] && !project.sections[sectionId as SectionNameType];
        }).length || 0, [selectedTemplate, reportSections, project?.sections]);


    const fullReportCreditCost = sectionsToGenerateCount > 0 ? sectionsToGenerateCount + 1 : 0;

    const canGenerateFullReport = useMemo(() => (
        (!!project?.proposal || !!project?.projectPlan || (project?.externalContext && project.externalContext.length > 0)) &&
        (userProfile ? userProfile.credits >= fullReportCreditCost : false) &&
        fullReportCreditCost > 1 &&
        !isAnythingGenerating
    ), [project, userProfile, fullReportCreditCost, isAnythingGenerating]);
    
    const getGenerationPlan = async () => {
        if (!selectedTemplate || !project) {
            toast({ title: "No Template or Project Loaded", variant: "destructive" });
            return null;
        }

        const sectionsToGenerate = selectedTemplate.sectionIds
            .filter((sectionId): sectionId is SectionNameType => !!reportSections[sectionId] && !project.sections?.[sectionId as SectionNameType]);

        if (sectionsToGenerate.length === 0) {
            toast({ title: "Report Complete", description: "All sections for this template have already been generated." });
            return null;
        }

        try {
            const token = await getAuthenticatedToken(firebaseUser);
            const evaluationBody = {
                proposal: project.proposal,
                projectPlan: project.projectPlan,
                existingSections: project.sections,
                existingDiagrams: project.diagrams,
                sectionsToGenerate,
                externalContext: project.externalContext,
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
        if (!project) return;
        setIsPlanning(true);
        const plan = await getGenerationPlan();
        setIsPlanning(false);

        if (plan) {
            setActiveMutationKey('full-report');
            const fullReportBody = {
                proposal: project.proposal,
                projectPlan: project.projectPlan,
                existingSections: project.sections,
                existingDiagrams: project.diagrams,
                externalContext: project.externalContext,
                generationPlan: plan.configs,
            };
            fullReportMutation.mutate(fullReportBody);
        }
    };
    
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
        canGenerateFullReport,
        hasCreditsForSingleSection,
        agentsLoaded,
        sectionsLoading,
        templatesLoading,
        reportTemplates,
        selectedReportTemplateId,
        setSelectedReportTemplateId,
        fullReportCreditCost,
        orderedSections,
    };
}
