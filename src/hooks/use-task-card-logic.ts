
'use client';

import { useSectionLogic } from './use-section-logic';
import { useBuilderStore } from './useBuilderStore';

interface UseTaskCardLogicProps {
  phaseIndex: number;
  taskIndex: number;
  fieldName: 'description' | 'acceptanceCriteria';
}

export function useTaskCardLogic({ phaseIndex, taskIndex, fieldName }: UseTaskCardLogicProps) {
  const { project, updateProject } = useBuilderStore();

  const task = project?.projectPlan?.phases?.[phaseIndex]?.tasks?.[taskIndex];
  let content = '';

  if (task) {
    if (fieldName === 'description') {
      content = task.description;
    } else if (fieldName === 'acceptanceCriteria') {
      content = task.acceptanceCriteria.join('\n');
    }
  }

  const handleUpdate = (key: string, newValue: string) => {
    if (project && task) {
      updateProject(p => {
        if (p.projectPlan?.phases?.[phaseIndex]?.tasks?.[taskIndex]) {
          const taskToUpdate = p.projectPlan.phases[phaseIndex].tasks[taskIndex];
          if (fieldName === 'description') {
            taskToUpdate.description = newValue;
          } else if (fieldName === 'acceptanceCriteria') {
            taskToUpdate.acceptanceCriteria = newValue.split('\n').filter(line => line.trim() !== '');
          }
        }
      });
    }
  };

  const sectionLogic = useSectionLogic(
    `plan-${phaseIndex}-${taskIndex}-${fieldName}` as any, // Create a unique key
    content,
    handleUpdate
  );

  return {
    ...sectionLogic,
    projectPlan: project?.projectPlan,
  };
}
