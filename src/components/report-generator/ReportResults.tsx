
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const A4Page = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="bg-background shadow-lg p-8 md:p-12 mx-auto my-8" style={{ width: '210mm', minHeight: '297mm' }}>
        <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>
        {children}
    </div>
);

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const { sections, evaluation, removeSection } = useReportStore();
  const { t } = useLocalization();
  
  const generatedSections = orderedSections.filter(key => sections[key]);
  
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

  return (
     <div className="h-full bg-slate-200 dark:bg-slate-900/50 p-4 rounded-lg">
        <ScrollArea className="h-full">
            {generatedSections.map(key => (
                <A4Page key={key} title={t(sectionConfig[key].title)}>
                    <Section
                        sectionKey={key}
                        title={t(sectionConfig[key].title)}
                        icon={sectionConfig[key].icon}
                        content={sections[key]!}
                        onUpdate={onSectionUpdate}
                    />
                </A4Page>
            ))}
             {/* Evaluation Section */}
             <A4Page title={t('builder.Section.evaluationTab')}>
                {evaluation ? (
                    <EvaluationResultViewer evaluation={evaluation} />
                ) : (
                    <EvaluationTools />
                )}
             </A4Page>
        </ScrollArea>
    </div>
  );
};
