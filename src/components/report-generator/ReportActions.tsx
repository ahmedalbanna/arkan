
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, FilePlus2, Loader2, Presentation } from 'lucide-react';
import type { ProjectProposal, PresentationSlide } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import { type TemplateKey } from '@/lib/docx-styles';
import { exportReportAsDocx, exportProposalAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { exportPresentationAsPptx } from '@/lib/pptx-exporter';
import { usePptxStyles } from '@/hooks/use-pptx-styles';
import { PptxTemplateKey } from '@/lib/pptx-styles';

interface ReportActionsProps {
  proposal: ProjectProposal | null;
  reportState: ReportState;
  onNewSession: () => void;
  isGenerating: boolean;
  createFormAction: (formData: FormData) => void;
}

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';
const PPTX_TEMPLATE_KEY = 'arkan-pptx-template';

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
  const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
  const { templates: pptxTemplates, isLoaded: pptxLoaded } = usePptxStyles();
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<TemplateKey>('modern');
  const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');

  useEffect(() => {
    const savedDocxTemplate = localStorage.getItem(DOCX_TEMPLATE_KEY) as TemplateKey | null;
    if (savedDocxTemplate && docxTemplates[savedDocxTemplate]) {
      setSelectedDocxTemplate(savedDocxTemplate);
    }
  }, [docxTemplates]);

  useEffect(() => {
    const savedPptxTemplate = localStorage.getItem(PPTX_TEMPLATE_KEY) as PptxTemplateKey | null;
    if (savedPptxTemplate && pptxTemplates[savedPptxTemplate]) {
      setSelectedPptxTemplate(savedPptxTemplate);
    }
  }, [pptxTemplates]);

  const handleDocxTemplateChange = (key: TemplateKey) => {
    setSelectedDocxTemplate(key);
    localStorage.setItem(DOCX_TEMPLATE_KEY, key);
  }

  const handlePptxTemplateChange = (key: PptxTemplateKey) => {
    setSelectedPptxTemplate(key);
    localStorage.setItem(PPTX_TEMPLATE_KEY, key);
  }
  
  const hasContent = Object.values(reportState.sections).some(s => !!s) || Object.values(reportState.diagrams || {}).some(d => !!d);

  const handleExportReportDOCX = async () => {
    if (!hasContent) return;
    let proposalTitle = 'Project Report';
    if (proposal && proposal.title) {
        proposalTitle = proposal.title;
    }
    await exportReportAsDocx(reportState.sections, reportState.diagrams || {}, proposalTitle, selectedDocxTemplate);
  };

  const handleExportProposalDOCX = async () => {
    if (!proposal) return;
    await exportProposalAsDocx(proposal, selectedDocxTemplate);
  };
  
  const handleExportPresentation = () => {
    if (!reportState.presentation?.slides) return;
    exportPresentationAsPptx(reportState.presentation.slides, selectedPptxTemplate);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('reportGenerator.actionsTitle')}</CardTitle>
        <CardDescription>{t('reportGenerator.actionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="docx-template-select">DOCX Template</Label>
                {docxLoaded ? (
                  <Select value={selectedDocxTemplate} onValueChange={handleDocxTemplateChange}>
                      <SelectTrigger id="docx-template-select">
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
            <div className="space-y-2">
                <Label htmlFor="pptx-template-select">PPTX Template</Label>
                {pptxLoaded ? (
                  <Select value={selectedPptxTemplate} onValueChange={handlePptxTemplateChange}>
                      <SelectTrigger id="pptx-template-select">
                          <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                          {Object.entries(pptxTemplates).map(([key, template]) => (
                              <SelectItem key={key} value={key}>{(template as any).name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                ) : <Loader2 className="h-5 w-5 animate-spin" /> }
            </div>
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
            {reportState.presentation && (
               <Button onClick={handleExportPresentation} disabled={isGenerating} className="w-full sm:w-auto font-headline">
                 <Presentation className="mr-2 h-4 w-4" />
                 Export Presentation
               </Button>
            )}
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
