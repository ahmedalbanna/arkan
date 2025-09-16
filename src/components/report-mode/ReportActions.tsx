
'use client';

import { Button } from '@/components/ui/button';
import { FileText, Languages, Loader2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useReportActions } from '@/hooks';

interface ReportActionsProps {
    onTranslateAll: (targetLang: 'en' | 'ar') => void;
    isTranslating: boolean;
}

export const ReportActions = ({ onTranslateAll, isTranslating }: ReportActionsProps) => {
  const {
    t,
    isBusy,
    hasContent,
    docxTemplates,
    docxLoaded,
    selectedDocxTemplate,
    handleDocxTemplateChange,
    generatedSectionKeys,
    selectedSectionsForExport,
    setSelectedSectionsForExport,
    handleExportReportDOCX,
    isExporting,
    reportSections,
  } = useReportActions(isTranslating);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isBusy || !hasContent}>
                <Languages className="me-2 h-4 w-4" />
                <span>{t('builder.proposalActions.translateProposal')}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onTranslateAll('en')} disabled={isBusy}>Translate to English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTranslateAll('ar')} disabled={isBusy}>Translate to Arabic</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isBusy || !hasContent}>
                <Download className="me-2 h-4 w-4" />
                {t('builder.reportGenerator.exportReport')}
            </Button>
        </DropdownMenuTrigger>
         <DropdownMenuContent className="w-64">
             <div className="px-2 py-1.5">
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
                ) : <Loader2 className="h-5 w-5 animate-spin" />}
             </div>
             <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportReportDOCX} disabled={selectedSectionsForExport.length === 0 || isBusy}>
                <FileText className="me-2 h-4 w-4" />
                <span>{t('builder.proposalActions.downloadDocx')}</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
};
