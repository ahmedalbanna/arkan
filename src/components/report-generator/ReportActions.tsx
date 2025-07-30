
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Languages, Loader2, Download, FileJson } from 'lucide-react';
import type { TemplateKey } from '@/lib/docx-styles';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../ui/dropdown-menu';
import { sectionConfig } from '@/lib/report-config';
import { SectionName } from '@/ai/schemas';
import { useExport } from '@/hooks/use-export';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

interface ReportActionsProps {
    onTranslateAll: (targetLang: 'en' | 'ar') => void;
    isTranslating: boolean;
}

export const ReportActions = ({ onTranslateAll, isTranslating }: ReportActionsProps) => {
  const { t } = useLocalization();
  const { proposal } = useBuilderStore();
  const { sections } = useReportStore();
  const { diagrams } = useDiagramStore();
  const { templates: docxTemplates, isLoaded: docxLoaded } = useDocxStyles();
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<TemplateKey>('modern');
  const { exportReportDocx, isExporting } = useExport();

  const generatedSectionKeys = Object.keys(sections).filter(key => sections[key as SectionName]) as SectionName[];
  const [selectedSectionsForExport, setSelectedSectionsForExport] = useState<SectionName[]>(generatedSectionKeys);

  // Update selection when generated sections change
  useEffect(() => {
    setSelectedSectionsForExport(generatedSectionKeys);
  }, [JSON.stringify(generatedSectionKeys)]); // Use JSON.stringify to compare array content

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
  
  const hasContent = Object.values(sections).some(s => !!s) || Object.values(diagrams || {}).some(d => !!d);

  const handleExportReportDOCX = async () => {
    if (!hasContent) return;
    let proposalTitle = 'Project Report';
    if (proposal && proposal.title) {
        proposalTitle = proposal.title;
    }

    const translatedTitles = Object.keys(sectionConfig).reduce((acc, key) => {
      acc[key as SectionName] = t(sectionConfig[key as SectionName].title);
      return acc;
    }, {} as { [key in SectionName]?: string });

    const sectionsToExport = selectedSectionsForExport.reduce((acc, key) => {
        if (sections[key]) {
            acc[key] = sections[key];
        }
        return acc;
    }, {} as { [key in SectionName]?: string });

    await exportReportDocx(sectionsToExport, diagrams || {}, proposalTitle, selectedDocxTemplate, translatedTitles, selectedSectionsForExport);
  };

  const isBusy = isTranslating || isExporting;

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
                      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      {t('builder.reportGenerator.exportReport')}
                    </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-64">
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                             <FileText className="mr-2 h-4 w-4" />
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
                                    {t(sectionConfig[key]?.title) || key}
                                </DropdownMenuCheckboxItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={handleExportReportDOCX} 
                                disabled={selectedSectionsForExport.length === 0}
                                className="font-semibold"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export ({selectedSectionsForExport.length}) Section(s)
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className='w-full' disabled={isBusy || !hasContent}>
                        {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
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
