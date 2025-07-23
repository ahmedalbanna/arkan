
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Languages, Loader2 } from 'lucide-react';
import type { TemplateKey } from '@/lib/docx-styles';
import { exportProposalAsDocx } from '@/lib/docx-exporter';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const DOCX_TEMPLATE_KEY = 'arkan-docx-template';

interface ProposalActionsProps {
    isGenerating: boolean;
    isTranslating: boolean;
    onTranslate: (targetLang: 'en' | 'ar') => void;
}

export const ProposalActions = ({ isGenerating, isTranslating, onTranslate }: ProposalActionsProps) => {
  const { t } = useLocalization();
  const { proposal } = useBuilderStore();
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

  const handleExportDocx = () => {
    if (proposal) {
      exportProposalAsDocx(proposal, selectedDocxTemplate);
    }
  }

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
              <Select value={selectedDocxTemplate} onValueChange={handleDocxTemplateChange}>
                  <SelectTrigger id="docx-template-select">
                      <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                      {Object.entries(docxTemplates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>{t((template as any).name)}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            ) : <p>Loading templates...</p> }
        </div>
        <div className='flex flex-col space-y-2'>
            <Button onClick={handleExportDocx} disabled={isGenerating || !proposal} className="w-full font-headline">
              <Download className="mr-2 h-4 w-4" />
              {t('builder.proposalGenerator.exportDocx')}
            </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className='w-full' disabled={isTranslating}>
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
      </CardContent>
    </Card>
  );
};
