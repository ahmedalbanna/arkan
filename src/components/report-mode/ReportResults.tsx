
'use client';

import type { SectionName } from '@/ai/schemas';
import { ExportDialog } from '@/components/project/ExportDialog';
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
import { toast, useBuilderStore, useExport } from '@/hooks';
import { useReportPaginator } from '@/hooks/core/use-report-paginator';
import type { DocxTemplateKey } from '@/lib/docx-styles';
import type { Section } from '@/lib/models';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { SectionView } from './SectionView';

interface ReportResultsProps {
  generatedSections: SectionName[];
}

export const ReportResults = () => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const { isExporting, exportReportDocx } = useExport();

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

  const handleExport = async (
    sectionsToExport: Section[],
    options: { template: DocxTemplateKey; pageNumbers: boolean },
  ) => {
    if (!project) return;
    await exportReportDocx({
      sections: sectionsToExport,
      projectName: project.name || 'Untitled Report',
      options,
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
      <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
        <ScrollArea className="flex-grow">
          <A4Page
            key={currentChapter.id}
            onDelete={() => handleDeleteChapter(currentChapter.id)}
          >
            {currentChapter.sections.map((section, index) => (
              <div key={section.id} className="group relative mb-8 last:mb-0">
                <SectionView
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
            ))}
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
          <ExportDialog
            onExport={handleExport}
            isExporting={isExporting}
          />
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
