

'use client';

import { Button } from '@/components/ui/button';
import { Download, Languages, Loader2, Clipboard, ClipboardCheck, BrainCircuit, FileJson, FileText, FileDown, FileUp, File, FileCode } from 'lucide-react';
import type { TemplateKey } from '@/lib/docx-styles';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { summarizeProjectApi } from '@/services/proposal-service';
import { saveAs } from 'file-saver';
import { useReportStore } from '@/hooks/useReportStore';
import { useExport } from '@/hooks/use-export';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { SummarizeFullProjectOutput } from '@/ai/schemas';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

interface ProposalActionsProps {
    isGenerating: boolean;
    isTranslating: boolean;
    onTranslate: (targetLang: 'en' | 'ar') => void;
}

export const ProposalActions = ({ isGenerating, isTranslating, onTranslate }: ProposalActionsProps) => {
  const { t } = useLocalization();
  const { proposal, getFullState, name: projectName } = useBuilderStore();
  const { sections } = useReportStore();
  const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<TemplateKey>('modern');
  const [isCopied, setIsCopied] = useState(false);
  const { firebaseUser, refetchUser } = useAuth();
  const { exportProposal, isExporting } = useExport();

  const summarizeMutation = useMutation({
    mutationFn: summarizeProjectApi,
    onSuccess: (data) => {
        refetchUser();
        toast({
            title: t('builder.proposalActions.summaryReadyTitle'),
            description: (
                <div className="space-y-2">
                    <p>{t('builder.proposalActions.summaryReadyDesc')}</p>
                    <textarea readOnly className="w-full h-32 p-2 border rounded-md bg-muted text-xs" value={data.summary} />
                    <Button size="sm" variant="outline" onClick={() => {
                        navigator.clipboard.writeText(data.summary);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                    }}>
                        {isCopied ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                        {t('builder.proposalActions.copySummary')}
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

  const handleExport = (format: 'docx' | 'pdf') => {
    if (proposal) {
        exportProposal(format, proposal as any, selectedDocxTemplate);
    }
  }

  const handleSummarizeProject = async () => {
      if (!proposal || !firebaseUser) return;
      const reportMarkdown = Object.values(sections).filter(Boolean).join('\n\n---\n\n');
      const token = await firebaseUser.getIdToken();
      summarizeMutation.mutate({ body: { proposal, reportMarkdown }, token });
  }

  const isBusy = isGenerating || isTranslating || summarizeMutation.isPending || isExporting;

  return (
    <div className="flex items-center gap-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleSummarizeProject} variant="outline" size="icon" disabled={isBusy || !proposal}>
                        {summarizeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('builder.proposalActions.summarizeProject')}</p></TooltipContent>
            </Tooltip>
            
             <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" disabled={isBusy || !proposal}>
                                <Languages className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onTranslate('en')} disabled={isTranslating}>Translate to English</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTranslate('ar')} disabled={isTranslating}>Translate to Arabic</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent><p>{t('builder.proposalActions.translateProposal')}</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" disabled={isBusy || !proposal}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                             <div className="px-2 py-1.5 text-sm">
                                <Label htmlFor="docx-template-select">{t('builder.reportGenerator.docxTemplate')}</Label>
                                {docxLoaded ? (
                                <Select value={selectedDocxTemplate} onValueChange={handleDocxTemplateChange} disabled={isBusy}>
                                    <SelectTrigger id="docx-template-select" className="mt-1 h-8">
                                        <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {docxTemplates && Object.entries(docxTemplates).map(([key, template]) => (
                                            <SelectItem key={key} value={key}>{t((template as any).name)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                ) : <p>Loading...</p> }
                             </div>
                             <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleExport('docx')}>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>{t('builder.proposalActions.downloadDocx')}</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                <FileCode className="mr-2 h-4 w-4" />
                                <span>{t('builder.proposalActions.downloadPdf')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent><p>{t('builder.proposalActions.exportOptions')}</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
};
