
'use client';

import type { ProjectPlan, ProjectTask } from '@/ai/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { CheckSquare, ListTodo } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

function TaskCard({ task }: { task: ProjectTask }) {
  const { t } = useLocalization();
  return (
    <Card className="bg-background/50">
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            {t('builder.projectPlan.acceptanceCriteria')}
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
            {task.acceptanceCriteria.map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectPlanViewer({ projectPlan }: { projectPlan: ProjectPlan }) {
  const { t } = useLocalization();
  if (!projectPlan || !projectPlan.phases) {
    return null;
  }

  const defaultOpen = projectPlan.phases.length > 0 ? [projectPlan.phases[0].phaseName] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{t('builder.projectPlan.viewerTitle')}</CardTitle>
        <CardDescription>
          {t('builder.projectPlan.viewerDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={defaultOpen}>
          {projectPlan.phases.map((phase) => (
            <AccordionItem value={phase.phaseName} key={phase.phaseName} className="border rounded-lg bg-card">
              <AccordionTrigger className="font-headline text-lg p-4 hover:no-underline">
                {phase.phaseName}
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.tasks.map((task, index) => (
                    <TaskCard key={index} task={task} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
