
'use client';

import { useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks';
import { useGenerationUIStore } from '@/hooks';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { FileText } from 'lucide-react';
import { useSections } from './use-sections'; // Correct hook for section configs
import { useAgentStore } from './useAgentStore'; // Correct hook for agent icons

const defaultSelection = { sections: {}, diagrams: {}, externalContext: [], proposal: false, projectPlan: true };

export const useSectionAccordionItemLogic = (sectionKey: SectionNameType, hasCredits: boolean) => {
    const { t } = useLocalization();
    const { data: sectionConfigs } = useSections(); // Use the correct hook
    const getIconComponent = useAgentStore((state) => state.getIconComponent); // Get icon utility from agent store
    const { userProfile } = useAuth();
    const { project } = useBuilderStore();
    const { contextSelection } = useGenerationUIStore();

    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const sectionConfig = reportSections[sectionKey];

    const title = sectionConfig?.title || '';
    const agentId = sectionConfig?.agentId || '';
    const Icon = sectionConfig ? getIconComponent(sectionConfig.icon) || FileText : FileText;

    const currentSelection = contextSelection[sectionKey] || defaultSelection;

    const hasSelectedContext = useMemo(() => {
        if (!project) return false;
        const sel = currentSelection;
        const hasSections = Object.values(sel.sections || {}).some(v => v);
        const hasDiagrams = Object.values(sel.diagrams || {}).some(v => v);
        const hasExternal = (project.externalContext || []).filter((_, i) => sel.externalContext?.[i]).length > 0;

        return (sel.proposal && !!project.proposal) ||
            (sel.projectPlan && !!project.projectPlan) ||
            hasSections ||
            hasDiagrams ||
            hasExternal;
    }, [project, currentSelection]);

    const disabledReason = !hasCredits ? t('builder.toasts.insufficientCredits')
        : !hasSelectedContext ? "Please select a context (like the proposal) to generate this section."
            : null;

    return {
        t,
        sectionConfig,
        title,
        agentId,
        Icon,
        userProfile,
        hasSelectedContext,
        disabledReason,
    };
};
