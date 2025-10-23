
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import type { ProjectPlan } from '@/lib/models/project-plan';
import { ChevronLeft, ChevronRight, Kanban, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import A4Page from '../shared/A4Page';
import { KanbanBoard } from './kanban/KanbanBoard';
import { TaskItem } from './TaskItem';

export default function ProjectPlanViewer({ projectPlan }: { projectPlan: ProjectPlan }) {
  const { t } = useLocalization();
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [projectPlan]);

  if (!projectPlan || !projectPlan.phases) {
    return null;
  }

  const totalPages = projectPlan.phases.length;
  const currentPhase = projectPlan.phases[currentPage];

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="list" className="flex flex-col flex-grow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-2xl text-primary">{t('builder.projectPlan.viewerTitle')}</CardTitle>
              <CardDescription>{t('builder.projectPlan.viewerDescription')}</CardDescription>
            </div>
            <TabsList className="bg-gradient-to-r from-background/50 to-primary/5">
              <TabsTrigger
                value="list"
                className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"
              >
                <List className="me-2 h-4 w-4" /> List
              </TabsTrigger>
              <TabsTrigger
                value="board"
                className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"
              >
                <Kanban className="me-2 h-4 w-4" /> Board
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <TabsContent value="list" className="flex-grow flex flex-col mt-0">
          <div className="flex-grow bg-gradient-to-br from-slate-200 via-slate-100 to-primary/5 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-primary/5 p-4 rounded-b-lg">
            <ScrollArea className="h-[calc(100vh-270px)]">
              {currentPhase ? (
                <AnimatedContainer animation="fade-in-up" delay={200}>
                  <A4Page key={currentPhase.phaseName} title={currentPhase.phaseName}>
                    <div className="space-y-8">
                      {currentPhase.tasks.map((task, index) => (
                        <AnimatedContainer key={index} animation="fade-in-up" delay={300 + (index * 100)}>
                          <TaskItem task={task} phaseIndex={currentPage} taskIndex={index} />
                        </AnimatedContainer>
                      ))}
                    </div>
                  </A4Page>
                </AnimatedContainer>
              ) : <p>No phases available.</p>}
            </ScrollArea>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center p-4 border-t bg-gradient-to-r from-background/90 to-primary/5 backdrop-blur-sm rounded-b-lg">
              <AnimatedContainer animation="fade-in-up" delay={400}>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    variant="ghost"
                    className="hover:shadow-soft transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('builder.presentationGenerator.prev')}
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="board" className="flex-grow mt-0">
          <AnimatedContainer animation="fade-in-up" delay={200}>
            <KanbanBoard />
          </AnimatedContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
