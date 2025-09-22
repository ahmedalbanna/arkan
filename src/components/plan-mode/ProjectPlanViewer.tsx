
'use client';

import { useState, useEffect } from 'react';
import type { ProjectPlan, ProjectTask } from '@/ai/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckSquare, ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import A4Page from '../shared/A4Page';
import { useTaskCardLogic } from '@/hooks/use-task-card-logic'; // New hook
import { SectionToolbar } from '../section/SectionToolbar'; // Re-use toolbar

function TaskCard({ task, phaseIndex, taskIndex }: { task: ProjectTask, phaseIndex: number, taskIndex: number }) {
  const { t } = useLocalization();

  // Use the new hook for description
  const descriptionLogic = useTaskCardLogic({
    phaseIndex,
    taskIndex,
    fieldName: 'description',
  });

  // Use the new hook for acceptance criteria
  const acceptanceCriteriaLogic = useTaskCardLogic({
    phaseIndex,
    taskIndex,
    fieldName: 'acceptanceCriteria',
  });

  return (
    <Card className="bg-background/50 h-full flex flex-col rounded-lg shadow-lg hover:shadow-xl">
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4 flex-grow">
        <div>
           <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold">Description</h4>
                <SectionToolbar
                    isProcessingAi={descriptionLogic.isProcessingAi}
                    isReadingAloud={descriptionLogic.ttsMutation.isPending}
                    onAiAction={descriptionLogic.handleAiAction}
                    onReadAloud={descriptionLogic.handleReadAloud}
                />
            </div>
            <MarkdownViewer content={task.description} className="text-sm text-muted-foreground" />
             {descriptionLogic.aiSuggestion && (
                 <div className="mt-2 text-xs">AI Suggestion: {descriptionLogic.aiSuggestion}</div>
            )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                {t('builder.projectPlan.acceptanceCriteria')}
            </h4>
            <SectionToolbar
                isProcessingAi={acceptanceCriteriaLogic.isProcessingAi}
                isReadingAloud={acceptanceCriteriaLogic.ttsMutation.isPending}
                onAiAction={acceptanceCriteriaLogic.handleAiAction}
                onReadAloud={acceptanceCriteriaLogic.handleReadAloud}
            />
          </div>
           <div className="text-xs text-muted-foreground">
             <MarkdownViewer content={task.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')} />
           </div>
            {acceptanceCriteriaLogic.aiSuggestion && (
                 <div className="mt-2 text-xs">AI Suggestion: {acceptanceCriteriaLogic.aiSuggestion}</div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}


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
       <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{t('builder.projectPlan.viewerTitle')}</CardTitle>
        <CardDescription>
          {t('builder.projectPlan.viewerDescription')}
        </CardDescription>
      </CardHeader>
      <div className="flex-grow bg-slate-200 dark:bg-slate-900/50 p-4 rounded-b-lg">
        <ScrollArea className="h-[calc(100vh-270px)]">
            {currentPhase ? (
                 <A4Page key={currentPhase.phaseName} title={currentPhase.phaseName}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentPhase.tasks.map((task, index) => (
                            <TaskCard key={index} task={task} phaseIndex={currentPage} taskIndex={index} />
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
    </div>
  );
}
