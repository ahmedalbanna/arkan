
'use client';

import type { ProjectTask } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { useLocalization } from '@/context/LocalizationContext';
import { useTaskCardLogic } from '@/hooks/use-task-card-logic';
import { CheckSquare, ListTodo } from 'lucide-react';
import { SectionToolbar } from '../section/SectionToolbar';
import { MarkdownViewer } from '../shared/MarkdownViewer';

interface TaskItemProps {
  task: ProjectTask;
  phaseIndex: number;
  taskIndex: number;
}

export function TaskItem({ task, phaseIndex, taskIndex }: TaskItemProps) {
  const { t } = useLocalization();

  const descriptionLogic = useTaskCardLogic({
    phaseIndex,
    taskIndex,
    fieldName: 'description',
  });

  const acceptanceCriteriaLogic = useTaskCardLogic({
    phaseIndex,
    taskIndex,
    fieldName: 'acceptanceCriteria',
  });

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <div className="py-4 border-b last:border-b-0 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm rounded-lg p-4 shadow-soft hover:shadow-glow transition-all duration-200">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 font-headline">
          <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
            <ListTodo className="h-5 w-5 text-white" />
          </div>
          {task.title}
        </h3>

        <div className="pl-4 space-y-4">
          <AnimatedContainer animation="fade-in-up" delay={300}>
            <div className="rounded-lg border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm p-4 shadow-soft hover:shadow-glow transition-all duration-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-semibold font-headline">Description</h4>
                <SectionToolbar
                  isProcessingAi={descriptionLogic.isProcessingAi}
                  isReadingAloud={descriptionLogic.isReadingAloud}
                  onAiAction={descriptionLogic.handleAiAction}
                  onReadAloud={() => descriptionLogic.handleReadAloud(task.description)}
                />
              </div>
              <MarkdownViewer content={task.description} className="text-sm text-muted-foreground" />
              {descriptionLogic.aiSuggestion && (
                <div className="mt-2 text-xs p-2 rounded-md bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm">
                  AI Suggestion: {descriptionLogic.aiSuggestion}
                </div>
              )}
            </div>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-in-up" delay={400}>
            <div className="rounded-lg border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm p-4 shadow-soft hover:shadow-glow transition-all duration-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-semibold flex items-center gap-2 font-headline">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                    <CheckSquare className="h-4 w-4 text-white" />
                  </div>
                  {t('builder.projectPlan.acceptanceCriteria')}
                </h4>
                <SectionToolbar
                  isProcessingAi={acceptanceCriteriaLogic.isProcessingAi}
                  isReadingAloud={acceptanceCriteriaLogic.isReadingAloud}
                  onAiAction={acceptanceCriteriaLogic.handleAiAction}
                  onReadAloud={() => acceptanceCriteriaLogic.handleReadAloud(task.acceptanceCriteria.join('\n'))}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <MarkdownViewer content={task.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')} />
              </div>
              {acceptanceCriteriaLogic.aiSuggestion && (
                <div className="mt-2 text-xs p-2 rounded-md bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm">
                  AI Suggestion: {acceptanceCriteriaLogic.aiSuggestion}
                </div>
              )}
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </AnimatedContainer>
  );
}
