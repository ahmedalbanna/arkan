
'use client';

import { DiagramType, type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSections } from '@/hooks';
import { FileText } from 'lucide-react';
import { useMemo } from 'react';
import { useAgentStore } from './useAgentStore';
import { useGenerationUIStore } from './useGenerationUIStore';


export const useSectionAccordionItemLogic = (sectionKey: SectionNameType | DiagramType) => {
    const { t } = useLocalization();
    const { data: sectionConfigs } = useSections();
    const getIconComponent = useAgentStore((state) => state.getIconComponent);
    const { userProfile } = useAuth();
    const { project } = useBuilderStore();

    const sectionConfig = useMemo(() => {
        if (!sectionConfigs) return null;
        return sectionConfigs.find(s => s.id === sectionKey) || null;
    }, [sectionConfigs, sectionKey]);

    const title = sectionConfig?.title || '';
    const agentId = sectionConfig?.agentId || '';
    const Icon = sectionConfig ? getIconComponent(sectionConfig.icon) || FileText : FileText;
    
    // Auto-context means we no longer need to check for selected context.
    // The main check is just if there's *any* project content to work with.
    const hasProjectContext = !!project?.proposal || (project?.projectIdea && project.projectIdea.length > 0);

    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const disabledReason = !hasCredits ? t('builder.toasts.insufficientCredits')
        : !hasProjectContext ? t('builder.reportGenerator.noProposalDesc')
            : null;

    return {
        t,
        sectionConfig,
        title,
        agentId,
        Icon,
        userProfile,
        disabledReason,
    };
};
