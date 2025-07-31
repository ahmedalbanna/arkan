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
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

const orderedSections = Object.keys(sectionConfig) as SectionName[];

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
}

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const { sections, evaluation } = useReportStore();
  const { t } = useLocalization();
  
  const generatedSections = orderedSections.filter(key => sections[key]);
  const [activeSection, setActiveSection] = useState<SectionName | undefined>(generatedSections[0]);

  const hasContent = generatedSections.length > 0;

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

  const currentSectionContent = activeSection ? sections[activeSection] : null;

  return (
    <Card>
      <CardContent className="p-0">
        <ResizablePanelGroup direction="horizontal" className="min-h-[75vh] rounded-lg">
          <ResizablePanel defaultSize={25} minSize={20} className="p-2">
             <CardHeader className="p-2">
                <CardTitle className="font-headline text-lg">Report Sections</CardTitle>
             </CardHeader>
             <ScrollArea className="h-[calc(75vh-60px)]">
                <div className="space-y-1 pr-2">
                    {generatedSections.map(key => (
                         <Button
                            key={key}
                            variant={activeSection === key ? 'secondary' : 'ghost'}
                            onClick={() => setActiveSection(key)}
                            className="w-full justify-start gap-2"
                         >
                            {React.createElement(sectionConfig[key].icon, { className: "h-4 w-4" })}
                            <span className="truncate">{t(sectionConfig[key].title)}</span>
                         </Button>
                    ))}
                </div>
             </ScrollArea>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75} className="p-2">
             {activeSection && currentSectionContent ? (
                <Tabs defaultValue="view" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="view">View & Edit</TabsTrigger>
                        <TabsTrigger value="context">Context</TabsTrigger>
                        <TabsTrigger value="evaluation" disabled={!evaluation}>Evaluation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view" className="mt-4">
                        <Section
                            sectionKey={activeSection}
                            title={t(sectionConfig[activeSection].title)}
                            icon={sectionConfig[activeSection].icon}
                            content={currentSectionContent}
                            onUpdate={onSectionUpdate}
                        />
                    </TabsContent>
                    <TabsContent value="context" className="mt-4">
                        <ContextViewer itemKey={activeSection} />
                    </TabsContent>
                     <TabsContent value="evaluation" className="mt-4">
                        {evaluation ? (
                            <EvaluationResultViewer evaluation={evaluation} />
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No evaluation has been performed yet.</p>
                        )}
                    </TabsContent>
                </Tabs>
             ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    <p>Select a section from the left to view or edit it.</p>
                </div>
             )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
};
