
'use client';

import type { SectionName } from '@/ai/schemas';
import A4Page from '@/components/shared/A4Page';
import { Button } from '@/components/ui/button';
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
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { SectionView } from './SectionView';

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
    updateProject(p => {
      p.updateSectionContent(key, value);
    });
  };

  const handleTitleUpdate = (key: SectionName, newTitle: string) => {
    updateProject(p => {
      p.updateSectionTitle(key, newTitle);
    });
  };

  const handleAddSectionAtIndex = (chapterId: string, index: number) => {
    updateProject(p => {
      p.addSectionAtIndex(chapterId, index, 'New Section');
    });
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
    updateProject(p => {
      p.removeChapter(chapterId);
    });
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

    const hasSections = currentChapter.sections && currentChapter.sections.length > 0;

    return (
      <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
        <ScrollArea className="flex-grow">
          <A4Page
            key={currentChapter.id}
            onDelete={() => handleDeleteChapter(currentChapter.id)}
          >
            {hasSections ? (
              currentChapter.sections.map((section, index) => (
                <div key={section.id} className="group relative mb-8 last:mb-0">
                  <SectionView
                    chapterId={currentChapter.id}
                    chapterTitle={currentChapter.title}
                    sectionKey={section.id}
                    title={section.title}
                    content={section.content || ''}
                    onUpdate={handleSectionUpdate}
                    onTitleChange={handleTitleUpdate}
                    isFirst={index === 0}
                    isLast={index === currentChapter.sections.length - 1}
                    onMoveUp={() => handleMoveSectionUp(section.id)}
                    onMoveDown={() => handleMoveSectionDown(section.id)}
                    onDelete={() => handleDeleteSection(section.id)}
                  />
                  <div className="absolute -bottom-4 left-0 right-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-px bg-primary/20"></div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute h-8 w-8 rounded-full bg-background hover:bg-muted"
                      onClick={() =>
                        handleAddSectionAtIndex(currentChapter.id, index + 1)
                      }
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                  <SectionView
                    chapterId={currentChapter.id}
                    chapterTitle={currentChapter.title}
                    sectionKey={''}
                    title={''}
                    content={''}
                    onUpdate={() => {}}
                    onTitleChange={() => {}}
                    isFirst={true}
                    isLast={true}
                    onMoveUp={() => {}}
                    onMoveDown={() => {}}
                    onDelete={() => {}}
                  />
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">This chapter is empty.</h3>
                <p className="text-sm text-muted-foreground mb-4">Add a section to start building your report.</p>
                <Button onClick={() => handleAddSectionAtIndex(currentChapter.id, 0)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add First Section
                </Button>
              </div>
            )}
          </A4Page>
        </ScrollArea>
      </div>
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
        {renderContent()}
      </CardContent>
    </Card>
  );
};
