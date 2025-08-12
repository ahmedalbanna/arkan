
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from './Section';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig } from '@/lib/report-config';
import type { SectionName } from '@/ai/schemas';
import { FileText, Trash2 } from 'lucide-react';
import { useReportStore } from '@/hooks/useReportStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { ContextViewer } from './ContextViewer';
import { EvaluationResultViewer } from './EvaluationResultViewer';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { EvaluationTools } from '../EvaluationTools';

const orderedSections = Object.keys(sectionConfig) as SectionName[];

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
}

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const { sections, evaluation, removeSection } = useReportStore();
  const { t } = useLocalization();
  
  const generatedSections = orderedSections.filter(key => sections[key]);
  const [activeSection, setActiveSection] = useState<SectionName | undefined>(generatedSections[0]);

  // Effect to update activeSection if it gets deleted
  useEffect(() => {
    if (activeSection && !generatedSections.includes(activeSection)) {
      setActiveSection(generatedSections[0] || undefined);
    } else if (!activeSection && generatedSections.length > 0) {
      setActiveSection(generatedSections[0]);
    }
  }, [generatedSections, activeSection]);


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
                        <div key={key} className="group flex items-center">
                            <Button
                                variant={activeSection === key ? 'secondary' : 'ghost'}
                                onClick={() => setActiveSection(key)}
                                className="w-full justify-start gap-2 flex-grow"
                            >
                                {React.createElement(sectionConfig[key].icon, { className: "h-4 w-4" })}
                                <span className="truncate">{t(sectionConfig[key].title)}</span>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the "{t(sectionConfig[key].title)}" section. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => removeSection(key)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
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
                        <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
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
                           <EvaluationTools />
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
