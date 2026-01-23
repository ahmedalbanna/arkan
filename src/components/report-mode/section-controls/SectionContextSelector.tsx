
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContextSelector } from '@/hooks';
import type { ExternalContextType } from '@/lib/models';
import { FileText, Folder, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuilderStore } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';

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
  
  const { project, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [selectedSourceSection, setSelectedSourceSection] = useState<string>('');

  const fileTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook'];
  
  // Get all sections except current one for copying context from
  const otherSections = useMemo(() => {
    return reportSections.filter(s => {
      const section = s as any; // Type assertion for context property
      return s.id !== sectionId && (
        Object.keys(section.context?.sections || {}).length > 0 || 
        Object.keys(section.context?.externalContext || {}).length > 0
      );
    });
  }, [reportSections, sectionId]);
  
  const handleCopyContext = () => {
    if (!selectedSourceSection || !project) return;
    
    const sourceSection = project.getSection(selectedSourceSection);
    if (!sourceSection) return;
    
    // Copy the context from source section to current section
    updateProject(p => p.updateSection(sectionId, s => s.with({
      context: {
        sections: { ...sourceSection.context?.sections },
        externalContext: { ...sourceSection.context?.externalContext }
      }
    })));
    
    const linkedCount = Object.keys(sourceSection.context?.sections || {}).length + 
                       Object.keys(sourceSection.context?.externalContext || {}).length;
    
    toast({
      title: 'Context Copied',
      description: `Copied ${linkedCount} context link${linkedCount > 1 ? 's' : ''} from "${sourceSection.title}"`,
    });
    
    setSelectedSourceSection('');
  };

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
        {otherSections.length > 0 && (
          <div className="mb-4 p-3 border rounded-lg bg-muted/30">
            <Label className="text-xs font-semibold mb-2 block">Quick Copy from Another Section</Label>
            <div className="flex gap-2">
              <Select value={selectedSourceSection} onValueChange={setSelectedSourceSection}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Select section to copy from..." />
                </SelectTrigger>
                <SelectContent>
                  {otherSections.map(section => {
                    const sec = section as any; // Type assertion for context property
                    const contextCount = Object.keys(sec.context?.sections || {}).length + 
                                       Object.keys(sec.context?.externalContext || {}).length;
                    return (
                      <SelectItem key={section.id} value={section.id} className="text-xs">
                        {section.title} ({contextCount} link{contextCount > 1 ? 's' : ''})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopyContext}
                disabled={!selectedSourceSection}
                className="h-8 gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
          </div>
        )}
        <ScrollArea className="h-72">
          <Accordion type="multiple" defaultValue={['sections', 'files']}>
            <AccordionItem value="sections">
              <AccordionTrigger className="text-sm font-semibold"><Folder className="h-4 w-4 mr-2" /> Sections ({sectionOptions.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {sectionOptions.length > 0 ? (
                    sectionOptions.map((option) => (
                      <div key={`section-${option.id}`} className="flex items-center space-x-2">
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
                      <div key={`file-${option.id}`} className="flex justify-between items-center">
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
