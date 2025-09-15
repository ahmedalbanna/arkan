'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '../section/SectionView';
import type { SectionName } from '@/ai/schemas';
import { FileText, ChevronLeft, ChevronRight, Wand2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportResults } from '@/hooks';
import { GenerationTools } from './ReportGenerationTools';
import { EvaluationTools } from '../evaluation/EvaluationTools';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import A4Page from '@/components/shared/A4Page';

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
}

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const {
    t,
    sections,
    currentPage,
    totalPages,
    activeTab,
    setActiveTab,
    handleNextPage,
    handlePrevPage,
    hasContent,
    currentSectionKey,
    getSectionTitle,
    getSectionIcon,
    handleTranslateAll,
    isTranslatingAll,
  } = useReportResults();

  const renderContent = () => {
    if (!hasContent) {
        return (
            <Card className="flex items-center justify-center h-full min-h-[400px] mt-4">
                <div className="text-center text-muted-foreground p-8">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">{t('builder.reportGenerator.emptyStateTitle')}</h3>
                    <p>{t('builder.reportGenerator.emptyStateDesc')}</p>
                </div>
            </Card>
        );
    }
    return (
        <div className="h-full bg-slate-200 dark:bg-slate-900/50 p-4 gap-4 rounded-lg flex flex-col mt-4">
            <ScrollArea className="flex-grow">
                {currentSectionKey && (
                    <A4Page key={currentSectionKey} title={getSectionTitle(currentSectionKey)}>
                        <Section
                            sectionKey={currentSectionKey}
                            title={getSectionTitle(currentSectionKey)}
                            icon={getSectionIcon(currentSectionKey)}
                            content={sections[currentSectionKey]!}
                            onUpdate={onSectionUpdate}
                        />
                    </A4Page>
                )}
            </ScrollArea>
             {totalPages > 1 && (
                <div className="flex w-full justify-center items-center p-2 border-t bg-background rounded-b-lg max-w-a4 mx-auto">
                    <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {t('builder.presentationGenerator.prev')}
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground mx-4">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
                        {t('builder.presentationGenerator.next')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content" className="gap-2"><FileText className="h-4 w-4"/> {t('builder.tabs.document')}</TabsTrigger>
        <TabsTrigger value="generator" className="gap-2"><Wand2 className="h-4 w-4" /> {t('builder.proposalGenerator.tools.title')}</TabsTrigger>
        <TabsTrigger value="evaluator" className="gap-2"><Scale className="h-4 w-4" /> {t('builder.evaluation.title')}</TabsTrigger>
      </TabsList>
      <TabsContent value="content">
          {renderContent()}
      </TabsContent>
      <TabsContent value="generator">
         <GenerationTools onTranslateAll={handleTranslateAll} isTranslating={isTranslatingAll} />
      </TabsContent>
      <TabsContent value="evaluator">
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="font-headline">{t('builder.evaluation.title')}</CardTitle>
                <CardDescription>{t('builder.evaluation.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <EvaluationTools />
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
