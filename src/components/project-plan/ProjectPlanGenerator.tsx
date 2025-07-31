
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Sparkles, GanttChartSquare } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProjectPlanViewer from './ProjectPlanViewer';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

export default function ProjectPlanGenerator() {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const { proposal, projectIdea } = useBuilderStore();
  const { projectPlan } = useProjectPlanStore();
  
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  
  const mutation = useGenerateProjectPlan();

  useEffect(() => {
    // Pre-fill from proposal if available
    if (proposal) {
        setDescription(proposal.objective || '');
        setDeliverables(proposal.expected_outcome?.join('\n') || '');
    } else if (projectIdea) {
        setDescription(projectIdea);
    }
  }, [proposal, projectIdea]);


  const handleGeneratePlan = async () => {
    if (!firebaseUser) {
        toast({ title: "Authentication Required", variant: 'destructive' });
        return;
    }
    if (!description || !deliverables) {
      toast({
        title: 'Cannot Generate Plan',
        description: 'Please provide a project description and at least one deliverable.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate({ projectDescription: description, keyDeliverables: deliverables });
  };

  const canGenerate = (!!description.trim() && !!deliverables.trim()) && !mutation.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
      <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Planning</CardTitle>
            <CardDescription>Generate an actionable project plan from your project's description and key deliverables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="plan-description">Project Description</Label>
                <Textarea 
                    id="plan-description"
                    placeholder="Describe the main goals and purpose of the project."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    disabled={mutation.isPending}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="plan-deliverables">Key Deliverables / Features</Label>
                <Textarea 
                    id="plan-deliverables"
                    placeholder="List the main features or outcomes, one per line."
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    rows={4}
                    disabled={mutation.isPending}
                />
            </div>
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
                <p>Fill out the description and deliverables, then click "Generate Plan" to create an actionable project plan.</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
