
'use client';

import type { ProjectTask } from '@/ai/schemas';
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
    <div className="py-4 border-b last:border-b-0">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
        <ListTodo className="h-5 w-5 text-primary" />
        {task.title}
      </h3>

      <div className="pl-4 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-semibold">Description</h4>
            <SectionToolbar
              isProcessingAi={descriptionLogic.isProcessingAi}
              isReadingAloud={descriptionLogic.isReadingAloud}
              onAiAction={descriptionLogic.handleAiAction}
              onReadAloud={() => descriptionLogic.handleReadAloud(task.description)}
            />
          </div>
          <MarkdownViewer content={task.description} className="text-sm text-muted-foreground" />
          {descriptionLogic.aiSuggestion && (
            <div className="mt-2 text-xs">AI Suggestion: {descriptionLogic.aiSuggestion}</div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-semibold flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
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
            <div className="mt-2 text-xs">AI Suggestion: {acceptanceCriteriaLogic.aiSuggestion}</div>
          )}
        </div>
      </div>
    </div>
  );
}
