
'use client';

import type { ProjectTask } from '@/ai/schemas';
import { Card } from '@/components/ui/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

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
        className="opacity-50 border-primary border-2 h-24 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-glow"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 touch-none backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200 bg-gradient-to-r from-background/50 to-primary/5"
    >
      <div className="flex items-start gap-2">
        <div className="p-1 rounded-lg bg-gradient-to-br from-muted to-muted-foreground shadow-soft">
          <GripVertical className="h-5 w-5 text-white shrink-0 mt-1 cursor-grab" />
        </div>
        <div className="flex-grow">
          <p className="font-semibold text-sm leading-snug font-headline">{task.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        </div>
      </div>
    </Card>
  );
}
