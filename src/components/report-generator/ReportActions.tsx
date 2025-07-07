
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, FilePlus2, Loader2 } from 'lucide-react';
import type { ProjectProposal } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { exportReportAsDocx, exportProposalAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';
import { handleCreateProjectFromProposal } from '@/app/generate-report/actions';
import { useToast } from '@/hooks/use-toast';

interface ReportActionsProps {
  proposal: ProjectProposal | null;
  reportState: ReportState;
  onNewSession: () => void;
  isPending: boolean;
}

function CreateProjectSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto font-headline">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FilePlus2 className="mr-2 h-4 w-4" />
      )}
      Create Project
    </Button>
  );
}

export const ReportActions = ({ proposal, reportState, onNewSession, isPending }: ReportActionsProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [createState, createFormAction] = useActionState(handleCreateProjectFromProposal, null);

  useEffect(() => {
    if (createState?.error) {
      toast({
        title: "Error Creating Project",
        description: createState.error,
        variant: 'destructive'
      })
    }
  }, [createState, toast]);

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
        <Button onClick={handleExportProposalDOCX} disabled={!proposal || isPending} className="w-full sm:w-auto font-headline">
          <FileText className="mr-2 h-4 w-4" />
          {t('reportGenerator.exportProposal')}
        </Button>
        <Button onClick={handleExportReportDOCX} disabled={!hasContent || isPending} className="w-full sm:w-auto font-headline">
          <FileText className="mr-2 h-4 w-4" />
          {t('reportGenerator.exportReport')}
        </Button>
        <form action={createFormAction}>
            {proposal && <input type="hidden" name="proposalJson" value={JSON.stringify(proposal)} />}
            <CreateProjectSubmitButton disabled={!proposal || isPending} />
        </form>
        <Button onClick={onNewSession} variant="outline" disabled={isPending} className="w-full sm:w-auto font-headline">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('reportGenerator.newSession')}
        </Button>
      </CardContent>
    </Card>
  );
};
