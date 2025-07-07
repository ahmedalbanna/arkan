
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, FilePlus2, Loader2 } from 'lucide-react';
import type { ProjectProposal } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportReportAsDocx, exportProposalAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';

interface ReportActionsProps {
  proposal: ProjectProposal | null;
  reportState: ReportState;
  onNewSession: () => void;
  isGenerating: boolean;
  createFormAction: (formData: FormData) => void;
}

function CreateProjectSubmitButton({ disabled, formAction }: { disabled: boolean, formAction: (formData: FormData) => void }) {
  const { pending, action } = useFormStatus();
  const isThisActionPending = pending && action === formAction;

  return (
    <Button type="submit" formAction={formAction} disabled={isThisActionPending || disabled} className="w-full sm:w-auto font-headline">
      {isThisActionPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Create Project
        </>
      )}
    </Button>
  );
}

export const ReportActions = ({ proposal, reportState, onNewSession, isGenerating, createFormAction }: ReportActionsProps) => {
  const { t } = useLocalization();
  
  const hasContent = Object.values(reportState.sections).some(s => !!s) || Object.values(reportState.diagrams || {}).some(d => !!d);

  const handleExportReportDOCX = async () => {
    if (!hasContent) return;
    let proposalTitle = 'Project Report';
    if (proposal && proposal.title) {
        proposalTitle = proposal.title;
    }
    const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
    const template = templates[templateKey] || templates.modern;
    await exportReportAsDocx(reportState.sections, reportState.diagrams || {}, proposalTitle, template.styles);
  };

  const handleExportProposalDOCX = async () => {
    if (!proposal) return;
    const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
    const template = templates[templateKey] || templates.modern;
    await exportProposalAsDocx(proposal, template.styles);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('reportGenerator.actionsTitle')}</CardTitle>
        <CardDescription>{t('reportGenerator.actionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4 flex-wrap items-center">
        <Button onClick={handleExportProposalDOCX} disabled={!proposal || isGenerating} className="w-full sm:w-auto font-headline">
          <FileText className="mr-2 h-4 w-4" />
          {t('reportGenerator.exportProposal')}
        </Button>
        <Button onClick={handleExportReportDOCX} disabled={!hasContent || isGenerating} className="w-full sm:w-auto font-headline">
          <FileText className="mr-2 h-4 w-4" />
          {t('reportGenerator.exportReport')}
        </Button>
        <CreateProjectSubmitButton disabled={!proposal || isGenerating} formAction={createFormAction} />
        <Button onClick={onNewSession} variant="outline" disabled={isGenerating} className="w-full sm:w-auto font-headline">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('reportGenerator.newSession')}
        </Button>
      </CardContent>
    </Card>
  );
};
