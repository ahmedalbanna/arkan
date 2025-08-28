
'use client';

import { Card } from '@/components/ui/card';
import { Section } from '../section/SectionView';
import type { SectionName } from '@/ai/schemas';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';
import { useReportResults } from '@/hooks/use-report-results';

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
}

const A4Page = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="a4-page-max bg-background shadow-lg p-8 md:p-12">
        <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>
        {children}
    </div>
);

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const {
    t,
    sections,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    hasContent,
    currentSectionKey,
    getSectionTitle,
    getSectionIcon,
  } = useReportResults();

  if (!hasContent) {
    return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">{t('builder.reportGenerator.emptyStateTitle')}</h3>
                <p>{t('builder.reportGenerator.emptyStateDesc')}</p>
            </div>
        </Card>
    );
  }

  return (
     <div className="h-full bg-slate-200 dark:bg-slate-900/50 p-4 gap-4 rounded-lg flex flex-col">
      <div className="flex w-full gap-1 rtl:flex-row-reverse justify-center items-center p-4 border-t bg-background rounded-b-lg mx-auto max-w-a4">
        <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('builder.presentationGenerator.prev')}
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
          {t('builder.presentationGenerator.next')}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
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

    </div>
  );
};
