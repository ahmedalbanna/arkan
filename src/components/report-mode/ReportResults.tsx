
'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionView } from './SectionView';
import type { SectionName } from '@/ai/schemas';
import { FileText, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/hooks';
import A4Page from '@/components/shared/A4Page';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks/data/useAgents';
import { AgentCategory } from '@/lib/models/agent';
import { useMemo } from 'react';
import { useReportPaginator } from '@/hooks/core/use-report-paginator';

interface ReportResultsProps {
  generatedSections: SectionName[];
}

export const ReportResults = ({ generatedSections }: ReportResultsProps) => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const { agents } = useAgents();

  const reportAgents = useMemo(() => {
    if (!agents) return [];
    return agents.filter(a => a.category === AgentCategory.ReportGeneration);
  }, [agents]);

  const {
    currentPage,
    totalPages,
    currentSectionKey,
    getSectionTitle,
    handleNextPage,
    handlePrevPage,
    setCurrentPage,
  } = useReportPaginator(generatedSections, reportAgents);

  const handleSectionUpdate = (key: SectionName, value: string) => {
    updateProject(p => {
      p.updateSectionContent(key, value);
    });
  };

  const handleTitleUpdate = (key: SectionName, newTitle: string) => {
    updateProject(p => {
        p.updateSectionTitle(key, newTitle);
    });
  };
  
  const handleAddSection = () => {
    let newSectionId = '';
    updateProject(p => {
        newSectionId = p.addCustomSection();
    });

    if (newSectionId) {
        const newPageIndex = project?.sections?.findIndex(s => s.id === newSectionId) ?? totalPages;
        setCurrentPage(newPageIndex);
    }
  };

  const renderContent = () => {
    if (totalPages === 0) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-muted-foreground p-8">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('builder.reportGenerator.selectSectionPrompt')}</h3>
            <p className="text-sm mt-1">Or create a new blank section to get started.</p>
             <Button onClick={handleAddSection} className="mt-4">
                <PlusCircle className="me-2 h-4 w-4" />
                Create a Section
            </Button>
          </div>
        </div>
      );
    }

    const currentSection = project?.getSection(currentSectionKey);

    return (
        <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
            <ScrollArea className="flex-grow">
                {currentSectionKey && currentSection ? (
                    <A4Page key={currentSectionKey}>
                        <SectionView
                            sectionKey={currentSectionKey}
                            title={getSectionTitle(currentSectionKey)}
                            content={currentSection.content || ''}
                            onUpdate={handleSectionUpdate}
                            onTitleChange={handleTitleUpdate}
                        />
                    </A4Page>
                ) : (
                     <div className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center text-muted-foreground p-8">
                            <FileText className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">{t('builder.reportGenerator.selectSectionPrompt')}</h3>
                        </div>
                    </div>
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
                 <Button onClick={handleAddSection}>
                    <PlusCircle className="me-2 h-4 w-4" />
                    Create a Section
                </Button>
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
