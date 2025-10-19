
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast, useDocxStyles, useProposalModeGeneratorLogic } from '@/hooks';
import { BrainCircuit, Clipboard, ClipboardCheck, Download, FileCode, FileText, Languages, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';


interface ProposalActionsProps {
    isGenerating: boolean;
    isTranslating: boolean;
    onTranslate: (targetLang: 'en' | 'ar') => void;
}

export const ProposalActions = ({ isGenerating, isTranslating, onTranslate }: ProposalActionsProps) => {
    const {
        t,
        proposal,
        isExporting,
        summarizeMutation,
        handleExport,
        handleSummarizeProject,
    } = useProposalModeGeneratorLogic();

    // استخدام hook منفصل لإدارة قوالب DOCX
    const {
        templates: docxTemplates,
        isLoaded: docxLoaded,
        activeTemplateKey: selectedDocxTemplate,
        setActiveTemplateKey: handleDocxTemplateChange,
    } = useDocxStyles();

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
                        <Button
                            onClick={handleSummarizeProject}
                            variant="outline"
                            size="icon"
                            disabled={isBusy || !proposal}
                            className="hover:shadow-soft transition-all duration-200"
                        >
                            {summarizeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.proposalActions.summarizeProject')}</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={isBusy || !proposal}
                                    className="hover:shadow-soft transition-all duration-200"
                                >
                                    <Languages className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                                <DropdownMenuItem
                                    onClick={() => onTranslate('en')}
                                    disabled={isTranslating}
                                    className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                >
                                    Translate to English
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onTranslate('ar')}
                                    disabled={isTranslating}
                                    className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                >
                                    Translate to Arabic
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('builder.proposalActions.translateProposal')}</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={isBusy || !proposal}
                                    className="hover:shadow-soft transition-all duration-200"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                                <div className="px-2 py-1.5 text-sm">
                                    <Label htmlFor="docx-template-select">{t('builder.reportGenerator.docxTemplate')}</Label>
                                    {docxLoaded && docxTemplates ? (
                                        <Select value={selectedDocxTemplate || undefined} onValueChange={handleDocxTemplateChange} disabled={isBusy}>
                                            <SelectTrigger id="docx-template-select" className="mt-1 h-8 hover:shadow-soft transition-all duration-200">
                                                <SelectValue placeholder="Select a template" />
                                            </SelectTrigger>
                                            <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                                                {docxTemplates && Object.entries(docxTemplates).map(([key, template]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                        className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                                    >
                                                        {t((template as any)?.name || key)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : <p>Loading...</p>}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleExport('docx')}
                                    className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                >
                                    <FileText className="me-2 h-4 w-4" />
                                    <span>{t('builder.proposalActions.downloadDocx')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleExport('pdf')}
                                    className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:shadow-soft transition-all duration-200"
                                >
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
