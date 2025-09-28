
'use client';

import { useState, useEffect } from 'react';
import type { ProjectPlan, ProjectTask } from '@/ai/schemas';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, List, Kanban } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import A4Page from '../shared/A4Page';
import { TaskItem } from './TaskItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from './kanban/KanbanBoard';

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
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-2xl text-primary">{t('builder.projectPlan.viewerTitle')}</CardTitle>
              <CardDescription>{t('builder.projectPlan.viewerDescription')}</CardDescription>
            </div>
            <TabsList>
              <TabsTrigger value="list"><List className="me-2 h-4 w-4" /> List</TabsTrigger>
              <TabsTrigger value="board"><Kanban className="me-2 h-4 w-4" /> Board</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        
        <TabsContent value="list" className="flex-grow flex flex-col mt-0">
          <div className="flex-grow bg-slate-200 dark:bg-slate-900/50 p-4 rounded-b-lg">
            <ScrollArea className="h-[calc(100vh-270px)]">
                {currentPhase ? (
                    <A4Page key={currentPhase.phaseName} title={currentPhase.phaseName}>
                        <div className="space-y-8">
                            {currentPhase.tasks.map((task, index) => (
                                <TaskItem key={index} task={task} phaseIndex={currentPage} taskIndex={index} />
                            ))}
                        </div>
                    </A4Page>
                ) : <p>No phases available.</p>}
            </ScrollArea>
          </div>
          {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t bg-background rounded-b-lg">
                    <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {t('builder.presentationGenerator.prev')}
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
                        {t('builder.presentationGenerator.next')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </TabsContent>

        <TabsContent value="board" className="flex-grow mt-0">
          <KanbanBoard />
        </TabsContent>
       </Tabs>
    </div>
  );
}
