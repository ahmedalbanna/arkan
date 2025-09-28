
'use client';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';
import type { ProjectTask } from '@/ai/schemas';
import { KanbanTaskCard } from './KanbanTaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: ProjectTask[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const tasksIds = useMemo(() => tasks.map((task) => task.title), [tasks]);
  
  const { setNodeRef } = useSortable({
    id: id,
    data: {
      type: 'Column',
      tasks,
    },
  });

  return (
    <Card ref={setNodeRef} className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2">
        <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="space-y-2 p-2">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <KanbanTaskCard key={task.title} task={task} />
                    ))}
                </SortableContext>
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
