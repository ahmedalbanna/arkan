'use client';

import type { SectionName } from '@/ai/schemas';
import A4Page from '@/components/shared/A4Page';
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
import { ChevronLeft, ChevronRight, FileText, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChapterView } from '@/components/report-mode/ChapterView';
import { MenuBar } from './MenuBar';

export function ReportResults() {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const [newChapterTitle, setNewChapterTitle] = useState('');


  const {
    currentPage,
    totalPages,
    currentItem: currentChapter,
    handleNextPage,
    handlePrevPage,
  } = useReportPaginator();

  function handleSectionUpdate(key: SectionName, value: string) {
    updateProject(p => p.updateSection(key as string, s => s.with({ content: value })));
  };

  function handleSectionTitleUpdate(key: SectionName, newTitle: string) {
    updateProject(p => p.updateSection(key as string, s => s.with({ title: newTitle })));
  };

  function handleChapterTitleUpdate(chapterId: string, newTitle: string) {
    updateProject(p => p.updateChapter(chapterId, c => c.with({ title: newTitle })));
  };

  function handleAddSectionAtIndex(chapterId: string, index: number) {
    updateProject(p => p.addSectionToChapter(chapterId, "New Section", index));
  };

  function handleMoveSectionUp(sectionId: string) {
    updateProject(p => p.moveSectionUp(sectionId));
  };

  function handleMoveSectionDown(sectionId: string) {
    updateProject(p => p.moveSectionDown(sectionId));
  };

  function handleDeleteSection(sectionId: string) {
    updateProject(p => p.removeSection(sectionId));
  };

  function handleDeleteChapter(chapterId: string) {
    const newProject = project?.removeChapter(chapterId);
    if(newProject) {
        updateProject(() => newProject);
    }
    toast({
      title: 'Chapter Deleted',
      description: 'The chapter has been removed from your project.',
    });
  };

  function handleCreateFirstChapter() {
    if (!newChapterTitle.trim()) {
        toast({
            title: "Chapter title cannot be empty",
            variant: "destructive",
        });
        return;
    }
    updateProject(p => p.addChapter(newChapterTitle));
    setNewChapterTitle('');
    toast({
      title: "Chapter Created",
      description: `Your first chapter "${newChapterTitle}" is ready.`
    })
  }

  function renderContent() {
    if (!project?.hasContent()) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-muted-foreground p-8 max-w-md">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              Your Report is Empty
            </h3>
            <p className="text-sm mt-1 mb-6">
             Start by generating a proposal, or create your first chapter to get started.
            </p>
          </div>
        </div>
      );
    }

    if (totalPages === 0) {
        return (
             <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground p-8 max-w-md">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">
                  No Chapters to Display
                </h3>
                 <p className="text-sm mt-1 mb-6">
                 Create your first chapter to get started. You can also generate a Table of Contents from the tools panel.
                </p>
                <div className="flex w-full max-w-sm mx-auto items-center space-x-2">
                   <Input 
                    value={newChapterTitle} 
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Enter chapter title..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFirstChapter()}
                  />
                  <Button onClick={handleCreateFirstChapter}>
                    <PlusCircle className="me-2 h-4 w-4" /> Create Chapter
                  </Button>
                </div>
              </div>
            </div>
        )
    }

    return (
        currentChapter ? (
            <A4Page>
                <ChapterView
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
        ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground p-8 max-w-md">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Chapters to Display</h3>
                    <p className="text-sm mt-1 mb-6">Create your first chapter to get started.</p>
                </div>
            </div>
        )
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

        <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50 min-h-0">
            <ScrollArea className="flex-grow">
            {renderContent()}
            </ScrollArea>
            <MenuBar />
        </CardContent>
    </Card>
  );
};
