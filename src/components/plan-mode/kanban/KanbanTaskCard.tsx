
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import type { ProjectTask } from '@/ai/schemas';

interface KanbanTaskCardProps {
  task: ProjectTask;
}

export function KanbanTaskCard({ task }: KanbanTaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.title, // Use a unique ID for the task
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 border-primary border-2 h-24 rounded-lg bg-card"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 touch-none"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 mt-1 cursor-grab" />
        <div className="flex-grow">
          <p className="font-semibold text-sm leading-snug">{task.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        </div>
      </div>
    </Card>
  );
}
