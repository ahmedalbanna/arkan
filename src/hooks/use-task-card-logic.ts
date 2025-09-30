
'use client';

import { createUIHook } from '@/core';
import { useSectionLogic } from './use-section-logic';
import { useBuilderStore } from './useBuilderStore';

interface UseTaskCardLogicProps {
  phaseIndex: number;
  taskIndex: number;
  fieldName: 'description' | 'acceptanceCriteria';
}

/**
 * Hook محسن لإدارة بطاقات المهام
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
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

  const uiHook = createUIHook({
    initialState: {
      phaseIndex,
      taskIndex,
      fieldName,
      content,
      isEditing: false,
      hasChanges: false,
    },
    customLogic: (state: any, setState: any, toast: any) => {
      const handleEdit = () => {
        setState((prev: any) => ({ ...prev, isEditing: true }));
      };

      const handleSave = () => {
        setState((prev: any) => ({ ...prev, isEditing: false, hasChanges: false }));
        toast({ title: 'Task updated successfully!' });
      };

      const handleCancel = () => {
        setState((prev: any) => ({ ...prev, isEditing: false, hasChanges: false }));
      };

      const handleContentChange = (newContent: string) => {
        setState((prev: any) => ({
          ...prev,
          content: newContent,
          hasChanges: newContent !== content
        }));
        handleUpdate(fieldName, newContent);
      };

      const handleDelete = () => {
        if (project && task) {
          updateProject(p => {
            if (p.projectPlan?.phases?.[phaseIndex]?.tasks?.[taskIndex]) {
              p.projectPlan.phases[phaseIndex].tasks.splice(taskIndex, 1);
            }
          });
          toast({ title: 'Task deleted successfully!' });
        }
      };

      return {
        handleEdit,
        handleSave,
        handleCancel,
        handleContentChange,
        handleDelete,
        isEditing: state.isEditing,
        hasChanges: state.hasChanges,
        content: state.content,
      };
    }
  })();

  const sectionLogic = useSectionLogic(
    `plan-${phaseIndex}-${taskIndex}-${fieldName}` as any, // Create a unique key
    content,
    handleUpdate
  );

  return {
    // الوظائف الأساسية
    ...sectionLogic,
    projectPlan: project?.projectPlan,

    // الوظائف الجديدة من UI Hook
    ...uiHook,
  };
}
