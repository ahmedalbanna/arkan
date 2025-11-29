
'use client';

import A4Page from '@/components/shared/A4Page';
import type { SectionName } from '@/ai/schemas';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
import { useReportPaginator } from '@/hooks/core/use-report-paginator';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { ContentChapterView } from './ContentChapterView';

export const ReportResults = () => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();

  const {
    currentPage,
    totalPages,
    currentItem: currentChapter,
    handleNextPage,
    handlePrevPage,
  } = useReportPaginator();

  const handleSectionUpdate = (key: SectionName, value: string) => {
    updateProject(p => p.updateSectionContent(key, value));
  };

  const handleSectionTitleUpdate = (key: SectionName, newTitle: string) => {
    updateProject(p => p.updateSectionTitle(key, newTitle));
  };

  const handleChapterTitleUpdate = (chapterId: string, newTitle: string) => {
    updateProject(p => {
        const chap = p.getChapter(chapterId);
        if (chap) chap.title = newTitle;
    });
  };

  const handleAddSectionAtIndex = (chapterId: string, index: number) => {
    updateProject(p => p.addSectionAtIndex(chapterId, index, 'New Section'));
  };

  const handleMoveSectionUp = (sectionId: string) => {
    updateProject(p => p.moveSectionUp(sectionId));
  };

  const handleMoveSectionDown = (sectionId: string) => {
    updateProject(p => p.moveSectionDown(sectionId));
  };

  const handleDeleteSection = (sectionId: string) => {
    updateProject(p => p.removeSection(sectionId));
  };

  const handleDeleteChapter = (chapterId: string) => {
    updateProject(p => p.removeChapter(chapterId));
    toast({
      title: 'Chapter Deleted',
      description: 'The chapter has been removed from your project.',
    });
  };

  const renderContent = () => {
    if (totalPages === 0 || !currentChapter) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-muted-foreground p-8">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              {t('builder.reportGenerator.selectSectionPrompt')}
            </h3>
            <p className="text-sm mt-1">
              Or create a new chapter and section to get started.
            </p>
          </div>
        </div>
      );
    }

    return (
      <A4Page>
        <ContentChapterView
            chapter={currentChapter}
            onUpdateSection={handleSectionUpdate}
            onUpdateSectionTitle={handleSectionTitleUpdate}
            onUpdateChapterTitle={handleChapterTitleUpdate}
            onAddSection={handleAddSectionAtIndex}
            onMoveSectionUp={handleMoveSectionUp}
            onMoveSectionDown={handleMoveSectionDown}
            onDeleteSection={handleDeleteSection}
            onDeleteChapter={handleDeleteChapter}
        />
      </A4Page>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline">
              {t('builder.reportGenerator.resultsTitle')}
            </CardTitle>
            <CardDescription>
              {t('builder.reportGenerator.resultsDesc')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {totalPages > 1 && (
        <div className="flex w-full justify-center items-center p-2 border-y bg-background">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            variant="ghost"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('builder.presentationGenerator.prev')}
          </Button>
          <span className="text-sm font-medium text-muted-foreground mx-4">
            Chapter {currentPage + 1} of {totalPages}: {currentChapter?.title}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            variant="ghost"
          >
            {t('builder.presentationGenerator.next')}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
      <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50">
        <ScrollArea className="flex-grow">
         {renderContent()}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
