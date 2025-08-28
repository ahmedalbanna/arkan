// code explantion in docs/hooks/use-evaluation-result-viewer.md

'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportStore } from '@/hooks';
import { useGenerateReportSection } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { useProjectPlanStore } from '@/hooks';
import { SectionName, EvaluateReportOutput } from '@/ai/schemas';
import { CheckCircle, Frown, Meh, Smile, AlertTriangle, XCircle } from 'lucide-react';

export const getScoreColor = (score: number) => {
    if (score < 50) return 'text-destructive';
    if (score < 75) return 'text-yellow-500';
    return 'text-green-500';
};

export const getScoreIcon = (score: number) => {
    if (score < 50) return React.createElement(Frown, { className: "h-10 w-10" });
    if (score < 75) return React.createElement(Meh, { className: "h-10 w-10" });
    return React.createElement(Smile, { className: "h-10 w-10" });
};

export const getFeedbackStatusInfo = (status: "Acceptable" | "Weak" | "Not Present") => {
  switch (status) {
    case 'Acceptable':
      return { icon: CheckCircle, color: 'text-green-500' };
    case 'Weak':
      return { icon: AlertTriangle, color: 'text-yellow-500' };
    case 'Not Present':
      return { icon: XCircle, color: 'text-destructive' };
    default:
      return { icon: CheckCircle, color: 'text-muted-foreground' };
  }
};

export const useEvaluationResultViewer = () => {
    const { t } = useLocalization();
    const { setEvaluation, sections } = useReportStore();
    const generationMutation = useGenerateReportSection();
    const { proposal } = useBuilderStore();
    const { projectPlan } = useProjectPlanStore();

    const handleFixWithAi = (sectionKey: SectionName, suggestion: string) => {
        const sectionContent = sections[sectionKey];
        if (!sectionContent) {
            console.error(`Cannot fix: Section content for '${sectionKey}' not found.`);
            return;
        }

        const body = {
            proposal,
            projectPlan,
            sectionToGenerate: sectionKey,
            otherSections: sections,
            guidelines: [suggestion], // Use the solution as a one-time guideline
        };

        generationMutation.mutate({ body });
    };

    return {
        t,
        setEvaluation,
        generationMutation,
        handleFixWithAi,
        getScoreColor,
        getScoreIcon,
        getFeedbackStatusInfo,
    };
};
