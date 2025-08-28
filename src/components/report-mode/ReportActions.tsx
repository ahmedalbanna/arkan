
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Languages, Loader2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('builder.reportGenerator.actionsTitle')}</CardTitle>
        <CardDescription>{t('builder.reportGenerator.actionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            ) : <Loader2 className="h-5 w-5 animate-spin" /> }
        </div>
        <div className="flex flex-col space-y-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={!hasContent || isBusy} className="w-full font-headline">
                      {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
                      {t('builder.reportGenerator.exportReport')}
                    </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-64">
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                             <FileText className="me-2 h-4 w-4" />
                             <span>Download as DOCX</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="p-0">
                            <div className="p-2">
                                <DropdownMenuCheckboxItem
                                    checked={selectedSectionsForExport.length === generatedSectionKeys.length && generatedSectionKeys.length > 0}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        if (selectedSectionsForExport.length === generatedSectionKeys.length) {
                                            setSelectedSectionsForExport([]);
                                        } else {
                                            setSelectedSectionsForExport(generatedSectionKeys);
                                        }
                                    }}
                                >
                                    Select All ({generatedSectionKeys.length})
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />
                            </div>

                            {generatedSectionKeys.map(key => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={selectedSectionsForExport.includes(key)}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setSelectedSectionsForExport(prev =>
                                            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                                        );
                                    }}
                                >
                                    {t(reportSections[key]?.title) || key}
                                </DropdownMenuCheckboxItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleExportReportDOCX}
                                disabled={selectedSectionsForExport.length === 0}
                                className="font-semibold"
                            >
                                <Download className="me-2 h-4 w-4" />
                                Export ({selectedSectionsForExport.length}) Section(s)
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className='w-full' disabled={isBusy || !hasContent}>
                        {isTranslating ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Languages className="me-2 h-4 w-4" />}
                        {t('builder.reportGenerator.translateAll')}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onTranslateAll('en')} disabled={isTranslating}>
                        Translate to English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTranslateAll('ar')} disabled={isTranslating}>
                        Translate to Arabic
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
