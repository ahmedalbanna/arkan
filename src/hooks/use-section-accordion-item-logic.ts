'use client';

import { useMemo } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useSectionStore } from '@/hooks/useSectionStore';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { useReportStore } from '@/hooks/useReportStore';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { FileText } from 'lucide-react';

const defaultSelection = { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

export const useSectionAccordionItemLogic = (sectionKey: SectionNameType, hasCredits: boolean) => {
    const { t } = useLocalization();
    const { reportSections, getIconComponent } = useSectionStore();
    const { userProfile } = useAuth();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();
    const { externalContext, contextSelection } = useReportStore();

    const sectionConfig = reportSections[sectionKey];

    const title = sectionConfig?.title || '';
    const agentId = sectionConfig?.agentId || '';
    const Icon = sectionConfig ? getIconComponent(sectionConfig.icon) || FileText : FileText;

    const currentSelection = contextSelection[sectionKey] || defaultSelection;

    const hasSelectedContext = useMemo(() => {
        const sel = currentSelection;
        const hasSections = Object.values(sel.sections || {}).some(v => v);
        const hasDiagrams = Object.values(sel.diagrams || {}).some(v => v);
        const hasExternal = (externalContext || []).filter((_, i) => sel.externalContext?.[i]).length > 0;

        return (sel.proposal && !!proposal) ||
            (sel.projectPlan && !!projectPlan) ||
            hasSections ||
            hasDiagrams ||
            hasExternal;
    }, [proposal, projectPlan, currentSelection, externalContext]);

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
