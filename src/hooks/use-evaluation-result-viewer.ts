'use client';

import { EvaluateReportOutput, SectionName } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateReportSection } from '@/hooks';
import { AlertTriangle, CheckCircle, Frown, Meh, Smile, XCircle } from 'lucide-react';
import React from 'react';

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
  const project = useBuilderStore(s => s.project);
  const updateProject = useBuilderStore(s => s.updateProject);
  const generationMutation = useGenerateReportSection();

  // The `evaluation` property is temporarily dynamic. It should be formally added to the Project model.
  const evaluation = (project as any)?.evaluation as EvaluateReportOutput | undefined;

  const setEvaluation = (newEvaluation: EvaluateReportOutput | null) => {
    updateProject(p => {
      (p as any).evaluation = newEvaluation;
    });
  };

  const handleFixWithAi = (sectionKey: SectionName, suggestion: string) => {
    if (!project) return;

    const section = project.sections.getSection(sectionKey);
    if (!section?.hasContent()) {
      console.error(`Cannot fix: Section content for '${sectionKey}' not found.`);
      return;
    }

    const body = {
      proposal: project.proposal?.toJSON(),
      projectPlan: project.projectPlan,
      sectionToGenerate: sectionKey,
      otherSections: project.sections.toJSON(), // Pass serializable data
      guidelines: [suggestion],
    };

    generationMutation.mutate({ body });
  };

  return {
    t,
    evaluation,
    setEvaluation,
    generationMutation,
    handleFixWithAi,
    getScoreColor,
    getScoreIcon,
    getFeedbackStatusInfo,
  };
};
