'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContextSelector } from '@/hooks';
import type { ExternalContextType } from '@/lib/models';
import { FileText, Folder } from 'lucide-react';
import { useMemo } from 'react';

interface SectionContextSelectorProps {
  sectionId: string;
}

export function SectionContextSelector({ sectionId }: SectionContextSelectorProps) {
  const {
    t,
    reportSections,
    externalContext,
    handleContextChange,
    currentSelection,
  } = useContextSelector(sectionId);

  const fileTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook'];

  const sectionOptions = useMemo(() => reportSections.map(s => ({
    id: s.id,
    label: s.title,
    type: 'section',
  })), [reportSections]);

  const fileOptions = useMemo(() => externalContext.map(f => ({
    id: f.id,
    label: f.fileName,
    type: 'file',
  })), [externalContext]);

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-base">{t('builder.reportGenerator.tool_context_label')}</CardTitle>
        <CardDescription className="text-xs">{t('builder.reportGenerator.tool_context_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72">
          <Accordion type="multiple" defaultValue={['sections', 'files']}>
            <AccordionItem value="sections">
              <AccordionTrigger className="text-sm font-semibold"><Folder className="h-4 w-4 mr-2" /> Sections ({sectionOptions.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {sectionOptions.length > 0 ? (
                    sectionOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`context-sec-${sectionId}-${option.id}`}
                          checked={!!currentSelection.sections?.[option.id]}
                          onCheckedChange={(checked) => handleContextChange(sectionId, 'sections', option.id, checked ? 'context' : false)}
                        />
                        <Label htmlFor={`context-sec-${sectionId}-${option.id}`} className="text-sm font-normal cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">{t('builder.reportGenerator.noOtherSections')}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="files">
              <AccordionTrigger className="text-sm font-semibold"><FileText className="h-4 w-4 mr-2" /> Files ({fileOptions.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {fileOptions.length > 0 ? (
                    fileOptions.map((option) => (
                      <div key={option.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`context-file-${sectionId}-${option.id}`}
                            checked={!!currentSelection.externalContext?.[option.id]}
                            onCheckedChange={(checked) => handleContextChange(sectionId, 'externalContext', option.id, checked ? 'context' : false)}
                          />
                          <Label htmlFor={`context-file-${sectionId}-${option.id}`} className="text-sm font-normal cursor-pointer truncate" title={option.label}>
                            {option.label}
                          </Label>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{externalContext.find(f => f.id === option.id)?.type}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">{t('builder.files.toasts.noContext')}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
