
'use client';

import { useState, useEffect } from 'react';
import type { ProjectPlan, ProjectTask } from '@/ai/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckSquare, ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

function TaskCard({ task }: { task: ProjectTask }) {
  const { t } = useLocalization();
  return (
    // card into content project plan
    <Card className="bg-background/50 h-full rounded-lg shadow-lg hover:shadow-xl">
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

const A4Page = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="bg-background shadow-lg p-8 md:p-12 mx-auto" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
        <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>
        {children}
    </div>
);


export default function ProjectPlanViewer({ projectPlan }: { projectPlan: ProjectPlan }) {
  const { t } = useLocalization();
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [projectPlan]);

  if (!projectPlan || !projectPlan.phases) {
    return null;
  }

  const totalPages = projectPlan.phases.length;
  const currentPhase = projectPlan.phases[currentPage];

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };


  return (
    <div className="h-full flex flex-col">
       <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{t('builder.projectPlan.viewerTitle')}</CardTitle>
        <CardDescription>
          {t('builder.projectPlan.viewerDescription')}
        </CardDescription>
      </CardHeader>
      <div className="flex-grow bg-slate-200 dark:bg-slate-900/50 p-4 rounded-b-lg">
        <ScrollArea className="h-full">
            {currentPhase ? (
                 <A4Page key={currentPhase.phaseName} title={currentPhase.phaseName}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentPhase.tasks.map((task, index) => (
                            <TaskCard key={index} task={task} />
                        ))}
                    </div>
                </A4Page>
            ) : <p>No phases available.</p>}
        </ScrollArea>
      </div>
       {totalPages > 1 && (
            <div className="flex justify-center items-center p-4 border-t bg-background rounded-b-lg">
                <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="ghost">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('builder.presentationGenerator.prev')}
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="ghost">
                    {t('builder.presentationGenerator.next')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        )}
    </div>
  );
}
