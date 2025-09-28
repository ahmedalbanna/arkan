
'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskCard } from './KanbanTaskCard';
import { useBuilderStore } from '@/hooks';
import type { ProjectPlan, ProjectTask } from '@/ai/schemas';

type KanbanColumnId = 'To Do' | 'In Progress' | 'Done';

export function KanbanBoard() {
  const { project, updateProject } = useBuilderStore();
  const projectPlan = project?.projectPlan;
  
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const columns = useMemo(() => {
    const columnIds: KanbanColumnId[] = ['To Do', 'In Progress', 'Done'];
    return columnIds;
  }, []);

  const tasksByStatus = useMemo(() => {
    const tasks: Record<KanbanColumnId, ProjectTask[]> = {
      'To Do': [],
      'In Progress': [],
      'Done': [],
    };
    projectPlan?.phases.forEach((phase) => {
      phase.tasks.forEach((task) => {
        tasks[task.status].push(task);
      });
    });
    return tasks;
  }, [projectPlan]);


  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    // Drag and drop logic will be fully implemented in a subsequent step.
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
  
    const activeId = active.id;
    const overId = over.id;
  
    if (activeId === overId) return;
  
    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';
    const isOverAColumn = over.data.current?.type === 'Column';
  
    if (!isActiveATask) return;

    if (isActiveATask && isOverAColumn) {
        const activePhaseIndex = projectPlan?.phases.findIndex(p => p.tasks.some(t => t.title === activeId));
        const activeTaskIndex = projectPlan?.phases[activePhaseIndex!].tasks.findIndex(t => t.title === activeId);

        if (activePhaseIndex !== undefined && activeTaskIndex !== undefined) {
             updateProject(p => p.updateTaskStatus(activePhaseIndex, activeTaskIndex, overId as KanbanColumnId));
        }
    }
  }

  if (!projectPlan) return <div>No project plan loaded.</div>;

  return (
    <div className="grid grid-cols-3 gap-4 p-4 h-full">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <SortableContext items={columns}>
          {columns.map((colId) => (
            <KanbanColumn
              key={colId}
              id={colId}
              title={colId}
              tasks={tasksByStatus[colId]}
            />
          ))}
        </SortableContext>
        
        <DragOverlay>
            {activeTask && (
                <KanbanTaskCard task={activeTask} />
            )}
        </DragOverlay>

      </DndContext>
    </div>
  );
}
