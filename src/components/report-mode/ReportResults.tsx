
'use client';

import type { SectionName } from '@/ai/schemas';
import A4Page from '@/components/shared/A4Page';
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore } from '@/hooks';
import { AgentCategory } from '@/lib/models/agent';
import type { Project } from '@/lib/models/project';
import { BarChart3, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import React, { useMemo } from 'react';
import { Section as SectionView } from '../section/SectionView';

interface ReportResultsProps {
  generatedSections: SectionName[];
}

export const ReportResults = ({ generatedSections }: ReportResultsProps) => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore(); // Removed setProject
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
    if (!project) return;

    // Create a new function for the update to ensure immutability
    const updater = (currentProject: Project | null): Project | null => {
        if (!currentProject) return null;

        const section = currentProject.report.sectionsManager.getSection(key);
        if (section) {
            section.updateContent(value); 
            currentProject.setUnsavedChanges(true);
        }
        return currentProject; // Return the modified project
    };

    updateProject(updater);
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
    if (!hasContent || !project) {
      return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
          <div className="flex items-center justify-center h-full min-h-[400px] mt-4">
            <div className="text-center text-muted-foreground p-8">
              <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-primary/10 shadow-glow mb-4">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-headline font-semibold mb-2">{t('builder.reportGenerator.emptyStateTitle')}</h3>
              <p className="text-muted-foreground">{t('builder.reportGenerator.emptyStateDesc')}</p>
            </div>
          </div>
        </AnimatedContainer>
      );
    }

    const sectionObject = currentSectionKey
      ? project.report.sectionsManager.getSection(currentSectionKey)
      : null;

    return (
      <AnimatedContainer animation="fade-in-up" delay={300}>
        <div className="h-full p-4 gap-4 rounded-lg flex flex-col mt-4">
          <ScrollArea className="flex-grow">
            {currentSectionKey && sectionObject && (
              <A4Page key={currentSectionKey}>
                <SectionView
                  sectionKey={currentSectionKey}
                  title={getSectionTitle(currentSectionKey)}
                  content={{ content: sectionObject.content }} // Pass content as an object
                  onUpdate={handleSectionUpdate}
                />
              </A4Page>
            )}
          </ScrollArea>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card variant="glass" className="h-full flex flex-col overflow-hidden backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline font-semibold">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
                <CardDescription>{t('builder.reportGenerator.resultsDesc')}</CardDescription>
              </div>
            </div>
            {totalPages > 0 && (
              <Badge variant="secondary" className="shadow-soft">
                {totalPages} Sections
              </Badge>
            )}
          </div>
        </CardHeader>
        {totalPages > 1 && (
          <AnimatedContainer animation="fade-in-down" delay={300}>
            <div className="flex w-full justify-center items-center p-2 border-y bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                variant="ghost"
                className="hover:shadow-soft transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('builder.presentationGenerator.prev')}
              </Button>
              <span className="text-sm font-medium text-muted-foreground mx-4">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                variant="ghost"
                className="hover:shadow-soft transition-all duration-200"
              >
                {t('builder.presentationGenerator.next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </AnimatedContainer>
        )}
        <CardContent className="flex-grow flex flex-col p-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900/50 dark:to-slate-800/50">
          {renderContent()}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};
