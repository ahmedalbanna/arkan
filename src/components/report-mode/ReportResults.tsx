
'use client';

import type { SectionName } from '@/ai/schemas';
import A4Page from '@/components/shared/A4Page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext'; // Changed import
import { useAgents, useBuilderStore } from '@/hooks'; // Changed import
import { AgentCategory } from '@/lib/models/agent'; // Changed import
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import React, { useMemo } from 'react';
import { Section } from '../section/SectionView';

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

  const [currentPage, setCurrentPage] = React.useState(0);
  const totalPages = generatedSections.length;
  const hasContent = totalPages > 0;
  const currentSectionKey = hasContent ? generatedSections[currentPage] : undefined;

  const getSectionTitle = React.useCallback((sectionKey: SectionName) => {
    return reportAgents?.find(a => a.id.includes(sectionKey))?.name || sectionKey;
  }, [reportAgents]);

  const handleSectionUpdate = (key: SectionName, value: string) => {
    updateProject(p => {
      p.updateSectionContent(key, value);
    });
  };

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

    // Get the content for the current section
    let sectionContent = currentSectionKey && project?.sections ? (project.sections[currentSectionKey] || '') : '';

    // Additional processing to ensure we only get the text content
    if (sectionContent && typeof sectionContent === 'string') {
      // If the content looks like JSON, try to extract the actual text
      if (sectionContent.startsWith('{') && sectionContent.includes('"')) {
        try {
          const parsed = JSON.parse(sectionContent);
          // Try to find the actual content in various possible structures
          if (parsed.data && parsed.data[currentSectionKey]) {
            sectionContent = parsed.data[currentSectionKey];
          } else if (parsed[currentSectionKey]) {
            sectionContent = parsed[currentSectionKey];
          } else if (parsed.content) {
            sectionContent = parsed.content;
          } else if (typeof Object.values(parsed)[0] === 'string') {
            sectionContent = Object.values(parsed)[0] as string;
          }
        } catch (e) {
          // If parsing fails, keep the original content
          console.warn('Failed to parse JSON content:', e);
        }
      }
    }

    // Debug log to see what content we're getting
    console.log('Section content for', currentSectionKey, ':', sectionContent);

    return (
      <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
        <ScrollArea className="flex-grow">
          {currentSectionKey && (
            <A4Page key={currentSectionKey}>
              <Section
                sectionKey={currentSectionKey}
                title={getSectionTitle(currentSectionKey)}
                content={sectionContent}
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
