'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2 } from 'lucide-react';
import type { ProjectProposal } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportReportAsDocx, exportProposalAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';

interface ReportActionsProps {
  proposal: ProjectProposal | null;
  reportState: ReportState;
  onNewSession: () => void;
  isPending: boolean;
}

export const ReportActions = ({ proposal, reportState, onNewSession, isPending }: ReportActionsProps) => {
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
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleExportProposalDOCX} disabled={!proposal || isPending} className="w-full sm:w-auto font-headline">
          <FileText className="mr-2 h-4 w-4" />
          {t('reportGenerator.exportProposal')}
        </Button>
        <Button onClick={handleExportReportDOCX} disabled={!hasContent || isPending} className="w-full sm:w-auto font-headline">
          <FileText className="mr-2 h-4 w-4" />
          {t('reportGenerator.exportReport')}
        </Button>
        <Button onClick={onNewSession} variant="outline" disabled={isPending} className="w-full sm:w-auto font-headline">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('reportGenerator.newSession')}
        </Button>
      </CardContent>
    </Card>
  );
};
