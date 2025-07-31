'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from './Section';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig } from '@/lib/report-config';
import type { SectionName } from '@/ai/schemas';
import { FileText, PanelLeft, Rows } from 'lucide-react';
import { useReportStore } from '@/hooks/useReportStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { ContextViewer } from './ContextViewer';
import { EvaluationResultViewer } from './EvaluationResultViewer';
import { Button } from '../ui/button';

const orderedSections = Object.keys(sectionConfig) as SectionName[];

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
}

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const { sections, evaluation } = useReportStore();
  const { t } = useLocalization();
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'single' | 'side-by-side'>('single');
  
  const hasContent = sections && Object.values(sections).some(s => !!s);
  
  if (!hasContent) {
    return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">{t('builder.reportGenerator.emptyStateTitle')}</h3>
                <p>{t('builder.reportGenerator.emptyStateDesc')}</p>
            </div>
        </Card>
    )
  }

  const renderSingleView = () => (
     <Accordion 
        type="single" 
        collapsible 
        className="w-full space-y-4"
        onValueChange={setActiveAccordionItem}
        value={activeAccordionItem}
      >
        {orderedSections.map((key) => {
          const content = sections[key];
          const { title, icon: Icon } = sectionConfig[key];

          if (!content) return null;

          return (
             <AccordionItem value={key} key={key} className="bg-muted/30 rounded-lg border">
                 <AccordionTrigger className="font-headline text-lg p-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Icon className="mr-2 h-5 w-5 text-primary" /> {t(title)}
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t">
                     {content && <Section sectionKey={key} title={t(title)} icon={Icon} content={content} onUpdate={onSectionUpdate} />}
                </AccordionContent>
            </AccordionItem>
          )
        })}
    </Accordion>
  );

  const renderSideBySideView = () => (
     <ResizablePanelGroup direction="horizontal" className="min-h-[70vh] rounded-lg border">
        <ResizablePanel defaultSize={35}>
            {activeAccordionItem ? (
                <ContextViewer itemKey={activeAccordionItem} />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4">Select a section to view its context.</div>
            )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
            <Accordion 
                type="single" 
                collapsible 
                className="w-full h-full"
                onValueChange={setActiveAccordionItem}
                value={activeAccordionItem}
            >
                {orderedSections.map((key) => {
                    const content = sections[key];
                    const { title, icon: Icon } = sectionConfig[key];
                    if (!content) return null;

                    return (
                        <AccordionItem value={key} key={key} className="border-0 h-full flex flex-col">
                            <AccordionTrigger className="font-headline text-lg p-4 hover:no-underline border-b">
                                <div className="flex items-center gap-2">
                                    <Icon className="mr-2 h-5 w-5 text-primary" /> {t(title)}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 flex-grow">
                                <Section sectionKey={key} title={t(title)} icon={Icon} content={content} onUpdate={onSectionUpdate} />
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
             </Accordion>
        </ResizablePanel>
     </ResizablePanelGroup>
  );

  return (
    <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
             <CardTitle className="font-headline text-xl p-1">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
             <div className="flex items-center gap-1 border p-1 rounded-md">
                <Button variant={viewMode === 'single' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('single')}><Rows className="h-4 w-4" /></Button>
                <Button variant={viewMode === 'side-by-side' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('side-by-side')}><PanelLeft className="h-4 w-4" /></Button>
             </div>
           </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="report" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="report">Report Content</TabsTrigger>
                    <TabsTrigger value="evaluation" disabled={!evaluation}>Evaluation</TabsTrigger>
                </TabsList>
                <TabsContent value="report" className="mt-4">
                    {viewMode === 'single' ? renderSingleView() : renderSideBySideView()}
                </TabsContent>
                <TabsContent value="evaluation" className="mt-4">
                    {evaluation ? (
                        <EvaluationResultViewer evaluation={evaluation} />
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No evaluation has been performed yet.</p>
                    )}
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
};
