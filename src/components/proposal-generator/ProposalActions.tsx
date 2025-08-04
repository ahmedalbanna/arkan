
'use client';

import { Button } from '@/components/ui/button';
import { Download, Languages, Loader2, Clipboard, ClipboardCheck, BrainCircuit, FileJson, FileText } from 'lucide-react';
import type { TemplateKey } from '@/lib/docx-styles';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { SummarizeFullProjectOutput } from '@/ai/flows/summarize-project';
import { saveAs } from 'file-saver';
import { useReportStore } from '@/hooks/useReportStore';
import { useExport } from '@/hooks/use-export';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';
import { ProposalTemplate } from '@/services/template-service';

interface ProposalActionsProps {
    isGenerating: boolean;
    isTranslating: boolean;
    onTranslate: (targetLang: 'en' | 'ar') => void;
}

async function summarizeProjectApi(variables: { body: any; token: string }): Promise<SummarizeFullProjectOutput> {
    const response = await fetch('/api/summarize-project', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`
        },
        body: JSON.stringify(variables.body)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to summarize project');
    }
    return response.json();
}

export const ProposalActions = ({ isGenerating, isTranslating, onTranslate }: ProposalActionsProps) => {
  const { t } = useLocalization();
  const { proposal, getFullState, name: projectName } = useBuilderStore();
  const { sections } = useReportStore();
  const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<TemplateKey>('modern');
  const [isCopied, setIsCopied] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
  const { exportProposalDocx, isExporting } = useExport();

  const summarizeMutation = useMutation({
    mutationFn: summarizeProjectApi,
    onSuccess: (data) => {
        refetchUser();
        toast({
            title: "Project Summary Ready",
            description: (
                <div className="space-y-2">
                    <p>The AI has generated a summary of your project.</p>
                    <textarea readOnly className="w-full h-32 p-2 border rounded-md bg-muted text-xs" value={data.summary} />
                    <Button size="sm" variant="outline" onClick={() => {
                        navigator.clipboard.writeText(data.summary);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                    }}>
                        {isCopied ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                        Copy Summary
                    </Button>
                </div>
            ),
            duration: 15000,
        })
    },
    onError: (error: Error) => {
        toast({ title: "Summarization Failed", description: error.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    const savedDocxTemplate = localStorage.getItem(DOCX_TEMPLATE_KEY) as TemplateKey | null;
    if (savedDocxTemplate && docxTemplates && docxTemplates[savedDocxTemplate]) {
      setSelectedDocxTemplate(savedDocxTemplate);
    }
  }, [docxTemplates]);

  const handleDocxTemplateChange = (key: TemplateKey) => {
    setSelectedDocxTemplate(key);
    localStorage.setItem(DOCX_TEMPLATE_KEY, key);
  }

  const handleExportDocx = () => {
    if (proposal) {
 exportProposalDocx(proposal as any, selectedDocxTemplate);
 }
  }
  
  const handleExportJson = () => {
    if (!proposal) return;
    const jsonString = JSON.stringify(getFullState());
    const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
    const blob = new Blob([encodedData], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${projectName || 'arkan_project'}.arkan`);
  }

  const handleSummarizeProject = async () => {
      if (!proposal || !firebaseUser) return;
      const reportMarkdown = Object.values(sections).filter(Boolean).join('\n\n---\n\n');
      const token = await firebaseUser.getIdToken();
      summarizeMutation.mutate({ body: { proposal, reportMarkdown }, token });
  }

  const isBusy = isGenerating || isTranslating || summarizeMutation.isPending || isExporting;

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="docx-template-select">{t('builder.reportGenerator.docxTemplate')}</Label>
            {docxLoaded ? (
              <Select value={selectedDocxTemplate} onValueChange={handleDocxTemplateChange} disabled={isBusy}>
                  <SelectTrigger id="docx-template-select">
                      <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                      {docxTemplates && Object.entries(docxTemplates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>{t((template as any).name)}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            ) : <p>Loading templates...</p> }
        </div>
        <div className='flex flex-col space-y-2'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={isBusy || !proposal} className="w-full font-headline">
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Export
                    </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={handleExportDocx}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Download as DOCX</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJson}>
                        <FileJson className="mr-2 h-4 w-4" />
                        <span>Download as .arkan File</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleSummarizeProject} variant="outline" className="w-full" disabled={isBusy || !proposal}>
                {summarizeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Summarize Project
            </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className='w-full' disabled={isBusy || !proposal}>
                        {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                        {t('builder.proposalGenerator.translateAllButton')}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onTranslate('en')} disabled={isTranslating}>
                        Translate to English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTranslate('ar')} disabled={isTranslating}>
                        Translate to Arabic
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
  );
};
