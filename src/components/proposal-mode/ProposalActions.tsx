

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Languages, Loader2, Clipboard, ClipboardCheck, BrainCircuit, FileText, FileCode } from 'lucide-react';
import type { TemplateKey } from '@/lib/docx-styles';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProposalActionsLogic } from '@/hooks/use-proposal-actions-logic';


interface ProposalActionsProps {
    isGenerating: boolean;
    isTranslating: boolean;
    onTranslate: (targetLang: 'en' | 'ar') => void;
}

export const ProposalActions = ({ isGenerating, isTranslating, onTranslate }: ProposalActionsProps) => {
    const {
        t,
        proposal,
        docxTemplates,
        docxLoaded,
        selectedDocxTemplate,
        isExporting,
        summarizeMutation,
        handleDocxTemplateChange,
        handleExport,
        handleSummarizeProject,
    } = useProposalActionsLogic();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (summarizeMutation.isSuccess && summarizeMutation.data) {
            const summary = summarizeMutation.data.summary;
            toast({
                title: t('builder.proposalActions.summaryReadyTitle'),
                description: (
                    <div className="space-y-2">
                        <p>{t('builder.proposalActions.summaryReadyDesc')}</p>
                        <textarea readOnly className="w-full h-32 p-2 border rounded-md bg-muted text-xs" value={summary} title={t('builder.proposalActions.summaryTextareaTitle')} placeholder={t('builder.proposalActions.summaryTextareaPlaceholder')} aria-label={t('builder.proposalActions.summaryTextareaLabel')} />
                        <Button size="sm" variant="outline" onClick={() => {
                            navigator.clipboard.writeText(summary);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                        }}>
                            {isCopied ? <ClipboardCheck className="me-2 h-4 w-4" /> : <Clipboard className="me-2 h-4 w-4" />}
                            {t('builder.proposalActions.copySummary')}
                        </Button>
                    </div>
                ),
                duration: 15000,
            });
        }
    }, [summarizeMutation.isSuccess, summarizeMutation.data, t, isCopied]);

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
                                {docxLoaded && docxTemplates ? (
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
                                <FileText className="me-2 h-4 w-4" />
                                <span>{t('builder.proposalActions.downloadDocx')}</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                <FileCode className="me-2 h-4 w-4" />
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
