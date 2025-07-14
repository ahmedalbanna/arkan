
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { type TemplateKey } from '@/lib/docx-styles';
import { exportReportAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { useBuilderState } from '@/context/BuilderStateContext';

interface ReportActionsProps {
  isGenerating: boolean;
}

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

export const ReportActions = ({ isGenerating }: ReportActionsProps) => {
  const { t } = useLocalization();
  const { state: reportState, proposal } = useBuilderState();
  const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<TemplateKey>('modern');

  useEffect(() => {
    const savedDocxTemplate = localStorage.getItem(DOCX_TEMPLATE_KEY) as TemplateKey | null;
    if (savedDocxTemplate && docxTemplates[savedDocxTemplate]) {
      setSelectedDocxTemplate(savedDocxTemplate);
    }
  }, [docxTemplates]);

  const handleDocxTemplateChange = (key: TemplateKey) => {
    setSelectedDocxTemplate(key);
    localStorage.setItem(DOCX_TEMPLATE_KEY, key);
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


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('reportGenerator.actionsTitle')}</CardTitle>
        <CardDescription>Export your generated report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button onClick={handleExportReportDOCX} disabled={!hasContent || isGenerating} className="w-full font-headline">
          <FileText className="mr-2 h-4 w-4" />
          {t('reportGenerator.exportReport')}
        </Button>
      </CardContent>
    </Card>
  );
};
