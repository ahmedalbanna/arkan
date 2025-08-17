
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
    <Card className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full items-start">
            <div className="lg:col-span-3 border-r h-full">
                 <CardHeader className="p-4 border-b">
                    <CardTitle className="font-headline text-lg">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <ScrollArea className="h-[calc(80vh-100px)]">
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
                                                <AlertDialogTitle>{t('projects.deleteDialogTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('builder.reportGenerator.toasts.deleteSectionConfirmation').replace('{sectionName}', t(sectionConfig[key].title))}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('projects.cancelButton')}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => removeSection(key)}>{t('projects.deleteButton')}</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </div>
            <div className="lg:col-span-9 h-full">
                 {activeSection && currentSectionContent ? (
                    <div className="p-4">
                        <Tabs defaultValue="view" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="view">{t('builder.Section.viewEditTab')}</TabsTrigger>
                                <TabsTrigger value="evaluation">{t('builder.Section.evaluationTab')}</TabsTrigger>
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
                            <TabsContent value="evaluation" className="mt-4">
                                {evaluation ? (
                                <EvaluationResultViewer evaluation={evaluation} />
                                ) : (
                                <EvaluationTools />
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                 ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground min-h-[400px]">
                        <p>{t('builder.reportGenerator.selectSectionPrompt')}</p>
                    </div>
                 )}
            </div>
        </div>
    </Card>
  );
};
