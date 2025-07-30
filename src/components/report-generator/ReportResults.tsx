
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableSection } from '../EditableSection';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig } from '@/lib/report-config';
import type { SectionName, DiagramType } from '@/ai/schemas';
import { FileText, CheckCircle, Frown, Meh, Smile } from 'lucide-react';
import { useReportStore } from '@/hooks/useReportStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import DiagramViewer from '../diagram-generator/DiagramViewer';
import { Progress } from '../ui/progress';

const orderedSections = Object.keys(sectionConfig) as SectionName[];

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
}

const getScoreColor = (score: number) => {
    if (score < 50) return 'text-destructive';
    if (score < 75) return 'text-yellow-500';
    return 'text-green-500';
}

const getScoreIcon = (score: number) => {
    if (score < 50) return <Frown className="h-10 w-10" />;
    if (score < 75) return <Meh className="h-10 w-10" />;
    return <Smile className="h-10 w-10" />;
}

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const { sections, evaluation } = useReportStore();
  const { diagrams, handleDiagramCodeUpdate, setDiagramExplanation } = useDiagramStore();
  const { t } = useLocalization();
  
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

  return (
    <Card>
        <CardHeader>
           <CardTitle className="font-headline text-xl mb-4 p-1">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="report" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="report">Report Content</TabsTrigger>
                    <TabsTrigger value="evaluation" disabled={!evaluation}>Evaluation</TabsTrigger>
                </TabsList>
                <TabsContent value="report" className="mt-4">
                    <Accordion type="multiple" className="w-full space-y-4">
                        {orderedSections.map((key) => {
                          const content = sections[key];
                          const diagram = diagrams?.[key as unknown as DiagramType];
                          const { title, icon: Icon } = sectionConfig[key];

                          if (!content && !diagram) return null;

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
                                     {content && <EditableSection sectionKey={key} title={t(title)} icon={Icon} content={content} onUpdate={onSectionUpdate} />}
                                </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                    </Accordion>
                </TabsContent>
                <TabsContent value="evaluation" className="mt-4">
                    {evaluation ? (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                                <div className={getScoreColor(evaluation.evaluationScore)}>
                                    {getScoreIcon(evaluation.evaluationScore)}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{t('builder.reportGenerator.qualityScore')}</span>
                                        <span className={`font-bold text-lg ${getScoreColor(evaluation.evaluationScore)}`}>
                                            {evaluation.evaluationScore} / 100
                                        </span>
                                    </div>
                                    <Progress value={evaluation.evaluationScore} className="h-2"/>
                                </div>
                            </div>
                            <div className="space-y-2 p-4 border rounded-lg">
                                <h4 className="font-semibold">Summary & Feedback</h4>
                                <p className="text-sm text-muted-foreground">{evaluation.summary}</p>
                                <ul className="space-y-2 text-sm list-none pl-0">
                                    {evaluation.feedback.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 mt-1 text-green-500 shrink-0"/>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No evaluation has been performed yet.</p>
                    )}
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
};
