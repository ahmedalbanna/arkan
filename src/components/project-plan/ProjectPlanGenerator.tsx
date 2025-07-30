
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Sparkles, GanttChartSquare } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProjectPlanViewer from './ProjectPlanViewer';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';


export default function ProjectPlanGenerator() {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const { proposal } = useBuilderStore();
  const { projectPlan } = useProjectPlanStore();
  
  const mutation = useGenerateProjectPlan();

  const handleGeneratePlan = async () => {
    if (!proposal || !firebaseUser) {
      toast({
        title: 'Cannot Generate Plan',
        description: 'A project proposal must be generated first.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate({ proposal });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
      <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Planning</CardTitle>
            <CardDescription>Generate an actionable project plan from your proposal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGeneratePlan} disabled={!proposal || mutation.isPending} className="w-full">
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Plan
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9 lg:overflow-y-auto lg:pr-2">
        {mutation.isPending && (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <p>AI is analyzing your proposal and building the plan...</p>
            </div>
          </Card>
        )}
        {!mutation.isPending && projectPlan ? (
          <ProjectPlanViewer projectPlan={projectPlan} />
        ) : (
          !mutation.isPending && (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground p-8">
                <GanttChartSquare className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Project Plan Will Appear Here</h3>
                <p>Click "Generate Plan" to break down your proposal into actionable tasks.</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
