
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Presentation } from 'lucide-react';
import type { PresentationSlide } from '@/ai/schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { exportPresentationAsPptx } from '@/lib/pptx-exporter';
import { usePptxStyles } from '@/hooks/use-pptx-styles';
import { PptxTemplateKey } from '@/lib/pptx-styles';

interface PresentationActionsProps {
  slides?: PresentationSlide[];
  isGenerating: boolean;
}

const PPTX_TEMPLATE_KEY = 'arkan-pptx-template';

export const PresentationActions = ({ slides, isGenerating }: PresentationActionsProps) => {
  const { templates: pptxTemplates, isLoaded: pptxLoaded } = usePptxStyles();
  const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');

  useEffect(() => {
    const savedPptxTemplate = localStorage.getItem(PPTX_TEMPLATE_KEY) as PptxTemplateKey | null;
    if (savedPptxTemplate && pptxTemplates[savedPptxTemplate]) {
      setSelectedPptxTemplate(savedPptxTemplate);
    }
  }, [pptxTemplates]);

  const handlePptxTemplateChange = (key: PptxTemplateKey) => {
    setSelectedPptxTemplate(key);
    localStorage.setItem(PPTX_TEMPLATE_KEY, key);
  }

  const handleExportPresentation = () => {
    if (!slides) return;
    exportPresentationAsPptx(slides, selectedPptxTemplate);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Actions</CardTitle>
        <CardDescription>Export your generated presentation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="pptx-template-select">PPTX Template</Label>
            {pptxLoaded ? (
              <Select value={selectedPptxTemplate} onValueChange={handlePptxTemplateChange}>
                  <SelectTrigger id="pptx-template-select">
                      <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                      {Object.entries(pptxTemplates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>{(template as any).name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            ) : <Loader2 className="h-5 w-5 animate-spin" /> }
        </div>
        <Button onClick={handleExportPresentation} disabled={isGenerating || !slides || slides.length === 0} className="w-full font-headline">
          <Presentation className="mr-2 h-4 w-4" />
          Export Presentation
        </Button>
      </CardContent>
    </Card>
  );
};
