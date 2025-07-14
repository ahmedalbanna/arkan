
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, Loader2, Download } from 'lucide-react';
import type { ProjectProposal } from '@/ai/schemas';
import { type TemplateKey } from '@/lib/docx-styles';
import { exportReportAsDocx, exportProposalAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { saveAs } from 'file-saver';
import { useReportState } from '@/context/ReportStateContext';

interface ReportActionsProps {
  proposal: ProjectProposal | null;
  onNewSession: () => void;
  isGenerating: boolean;
}

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

export const ReportActions = ({ proposal, onNewSession, isGenerating }: ReportActionsProps) => {
  const { t } = useLocalization();
  const { state: reportState } = useReportState();
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

  const handleExportProposalDOCX = async () => {
    if (!proposal) return;
    await exportProposalAsDocx(proposal, selectedDocxTemplate);
  };
  
  const handleExportProjectFile = () => {
    if (!proposal) return;
    const projectData = {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        ...reportState
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json;charset=utf-8' });
    const fileName = `${proposal.title.replace(/[\s\W]/g, '_') || 'arkan_project'}.json`;
    saveAs(blob, fileName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('reportGenerator.actionsTitle')}</CardTitle>
        <CardDescription>{t('reportGenerator.actionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
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
        </div>
        <div className="flex flex-col gap-2">
            <Button onClick={handleExportProposalDOCX} disabled={!proposal || isGenerating} className="w-full font-headline">
              <FileText className="mr-2 h-4 w-4" />
              {t('reportGenerator.exportProposal')}
            </Button>
            <Button onClick={handleExportReportDOCX} disabled={!hasContent || isGenerating} className="w-full font-headline">
              <FileText className="mr-2 h-4 w-4" />
              {t('reportGenerator.exportReport')}
            </Button>
            <Button onClick={handleExportProjectFile} disabled={!proposal || isGenerating} variant="secondary" className="w-full font-headline">
              <Download className="mr-2 h-4 w-4" />
              Download Project File
            </Button>
            <Button onClick={onNewSession} variant="outline" disabled={isGenerating} className="w-full font-headline">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('reportGenerator.newSession')}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};
