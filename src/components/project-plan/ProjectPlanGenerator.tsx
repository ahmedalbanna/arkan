
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
  const { proposal, projectIdea } = useBuilderStore();
  const { projectPlan } = useProjectPlanStore();
  
  const mutation = useGenerateProjectPlan();

  const handleGeneratePlan = async () => {
    if (!firebaseUser) {
        toast({ title: "Authentication Required", variant: 'destructive' });
        return;
    }
    // A plan can be generated from either a full proposal or a simple idea.
    if (!proposal && !projectIdea) {
      toast({
        title: 'Cannot Generate Plan',
        description: 'A project proposal must be generated or an idea must be provided first.',
        variant: 'destructive',
      });
      return;
    }
    // Prioritize the full proposal if it exists.
    mutation.mutate({ proposal: proposal ?? undefined, projectIdea: proposal ? undefined : projectIdea });
  };

  const canGenerate = (!!proposal || !!projectIdea?.trim()) && !mutation.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
      <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Planning</CardTitle>
            <CardDescription>Generate an actionable project plan from your proposal or project idea.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGeneratePlan} disabled={!canGenerate} className="w-full">
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
              <p>AI is analyzing your input and building the plan...</p>
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
                <p>Click "Generate Plan" to break down your proposal or idea into actionable tasks.</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
