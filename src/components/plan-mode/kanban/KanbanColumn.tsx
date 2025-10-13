
'use client';

import type { ProjectTask } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useMemo } from 'react';
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
    <Card ref={setNodeRef} className="flex flex-col backdrop-blur-md shadow-soft hover:shadow-glow transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2">
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-2 p-2">
            <SortableContext items={tasksIds}>
              {tasks.map((task, index) => (
                <AnimatedContainer key={task.title} animation="fade-in-up" delay={index * 100}>
                  <KanbanTaskCard task={task} />
                </AnimatedContainer>
              ))}
            </SortableContext>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
