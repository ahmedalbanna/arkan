

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '../section/SectionView';
import type { SectionName } from '@/ai/schemas';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportModeGenerator } from '@/hooks';
import A4Page from '@/components/shared/A4Page';

interface ReportResultsProps {
  // NEW: Receive the list of generated sections directly as a prop
  generatedSections: SectionName[];
}

export const ReportResults = ({ generatedSections }: ReportResultsProps) => {
  // The hook is now only used for getting data and handlers, not for deriving `generatedSections`
  const {
    t,
    sections,
    getSectionTitle,
    getSectionIcon,
    handleSectionUpdate,
  } = useReportModeGenerator({ orderedSections: generatedSections, setOrderedSections: () => {} });

  const [currentPage, setCurrentPage] = React.useState(0);
  const totalPages = generatedSections.length;
  const hasContent = totalPages > 0;
  const currentSectionKey = hasContent ? generatedSections[currentPage] : undefined;

  React.useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    } else if (totalPages === 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const renderContent = () => {
    if (!hasContent) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] mt-4">
                <div className="text-center text-muted-foreground p-8">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">{t('builder.reportGenerator.emptyStateTitle')}</h3>
                    <p>{t('builder.reportGenerator.emptyStateDesc')}</p>
                </div>
            </div>
        );
    }
    return (
        <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
            <ScrollArea className="flex-grow">
                {currentSectionKey && (
                    <A4Page key={currentSectionKey}>
                        <Section
                            sectionKey={currentSectionKey}
                            title={getSectionTitle(currentSectionKey)}
                            icon={getSectionIcon(currentSectionKey)}
                            content={sections[currentSectionKey]!}
                            onUpdate={handleSectionUpdate}
                        />
                    </A4Page>
                )}
            </ScrollArea>
        </div>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
                    <CardDescription>{t('builder.reportGenerator.resultsDesc')}</CardDescription>
                </div>
            </div>
        </CardHeader>
        {totalPages > 1 && (
            <div className="flex w-full justify-center items-center p-2 border-y bg-background">
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
        <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50">
            {renderContent()}
        </CardContent>
    </Card>
  );
};
