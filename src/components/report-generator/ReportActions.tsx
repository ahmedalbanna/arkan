
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, FilePlus2, Loader2 } from 'lucide-react';
import type { ProjectProposal } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import { type TemplateKey } from '@/lib/docx-styles';
import { exportReportAsDocx, exportProposalAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';


interface ReportActionsProps {
  proposal: ProjectProposal | null;
  reportState: ReportState;
  onNewSession: () => void;
  isGenerating: boolean;
  createFormAction: (formData: FormData) => void;
}

const TEMPLATE_KEY = 'arkan-docx-template';

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
  const { templates: docxTemplates, isLoaded } = useDocxStyles();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('modern');

  useEffect(() => {
    const savedTemplate = localStorage.getItem(TEMPLATE_KEY) as TemplateKey | null;
    if (savedTemplate && docxTemplates[savedTemplate]) {
      setSelectedTemplate(savedTemplate);
    }
  }, [docxTemplates]);

  const handleTemplateChange = (key: TemplateKey) => {
    setSelectedTemplate(key);
    localStorage.setItem(TEMPLATE_KEY, key);
  }
  
  const hasContent = Object.values(reportState.sections).some(s => !!s) || Object.values(reportState.diagrams || {}).some(d => !!d);

  const handleExportReportDOCX = async () => {
    if (!hasContent) return;
    let proposalTitle = 'Project Report';
    if (proposal && proposal.title) {
        proposalTitle = proposal.title;
    }
    await exportReportAsDocx(reportState.sections, reportState.diagrams || {}, proposalTitle, selectedTemplate);
  };

  const handleExportProposalDOCX = async () => {
    if (!proposal) return;
    await exportProposalAsDocx(proposal, selectedTemplate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('reportGenerator.actionsTitle')}</CardTitle>
        <CardDescription>{t('reportGenerator.actionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="template-select">Export Template</Label>
            {isLoaded ? (
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="template-select">
                      <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                      {Object.entries(docxTemplates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>{(template as any).name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            ) : <Loader2 className="h-5 w-5 animate-spin" /> }
        </div>
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-center">
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
        </div>
      </CardContent>
    </Card>
  );
};
