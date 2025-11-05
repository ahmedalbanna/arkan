
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionView } from './SectionView';
import type { SectionName } from '@/ai/schemas';
import { FileText, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/hooks';
import A4Page from '@/components/shared/A4Page';
import { useLocalization } from '@/context/LocalizationContext';
import { useReportPaginator } from '@/hooks/core/use-report-paginator';

interface ReportResultsProps {
  generatedSections: SectionName[];
}

export const ReportResults = ({ generatedSections }: ReportResultsProps) => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();

  const {
    currentPage,
    totalPages,
    currentItem: currentChapter,
    handleNextPage,
    handlePrevPage,
    setCurrentPage,
  } = useReportPaginator();

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
        const targetChapterId = p.chapters && p.chapters.length > 0 ? p.chapters[p.chapters.length - 1].id : p.addChapter('Main Chapter');
        newSectionId = p.addCustomSection(targetChapterId, 'New Section');
    });

    if (newSectionId && project?.chapters) {
        const newChapterIndex = project.chapters.findIndex(c => c.sections.some(s => s.id === newSectionId));
        if (newChapterIndex !== -1) {
            setCurrentPage(newChapterIndex);
        }
    }
  };

  const renderContent = () => {
    if (totalPages === 0 || !currentChapter) {
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

    return (
        <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
            <ScrollArea className="flex-grow">
                <A4Page key={currentChapter.id}>
                    {currentChapter.sections.map(section => (
                        <div key={section.id} className="mb-8 last:mb-0">
                           <SectionView
                                chapterTitle={currentChapter.title}
                                sectionKey={section.id}
                                title={section.title}
                                content={section.content || ''}
                                onUpdate={handleSectionUpdate}
                                onTitleChange={handleTitleUpdate}
                            />
                        </div>
                    ))}
                </A4Page>
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
                    Chapter {currentPage + 1} of {totalPages}: {currentChapter?.title}
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
