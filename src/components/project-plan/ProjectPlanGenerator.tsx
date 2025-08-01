
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Sparkles, GanttChartSquare, BrainCircuit } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProjectPlanViewer from './ProjectPlanViewer';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useMutation } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';

async function summarizeProposalForPlanApi(proposal: any, token: string): Promise<any> {
    const response = await fetch('/api/summarize-project', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ proposal: proposal, reportMarkdown: '' }), // Send empty report as we only need proposal
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get suggestion from AI');
    }
    return response.json();
}


export default function ProjectPlanGenerator() {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const { proposal, projectIdea } = useBuilderStore();
  const { projectPlan } = useProjectPlanStore();
  
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  
  const planGenerationMutation = useGenerateProjectPlan();

  useEffect(() => {
    // Pre-fill from proposal if available
    if (proposal) {
        setDescription(proposal.objective || '');
        setDeliverables(proposal.expected_outcome?.join('\n') || '');
    } else if (projectIdea) {
        setDescription(projectIdea);
    }
  }, [proposal, projectIdea]);

  const suggestionMutation = useMutation({
      mutationFn: async () => {
          const token = await getAuthenticatedToken(firebaseUser);
          return summarizeProposalForPlanApi(proposal, token);
      },
      onSuccess: (data) => {
          // A real implementation would parse the summary better,
          // but for now we'll use a simple split.
          const parts = data.summary.split("Key Deliverables:");
          setDescription(parts[0]?.replace('Project Summary:', '').trim() || '');
          setDeliverables(parts[1]?.trim() || '');
          toast({ title: "Suggestion Applied", description: "The AI has filled in the details from your proposal." });
      },
      onError: (error: Error) => {
          toast({ title: 'Suggestion Failed', description: error.message, variant: 'destructive' });
      }
  });


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
    planGenerationMutation.mutate({ projectDescription: description, keyDeliverables: deliverables });
  };

  const isProcessing = planGenerationMutation.isPending || suggestionMutation.isPending;
  const canGenerate = (!!description.trim() && !!deliverables.trim()) && !isProcessing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
      <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Project Planning</CardTitle>
               <Button variant="ghost" size="sm" onClick={() => suggestionMutation.mutate()} disabled={!proposal || isProcessing}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                AI Suggest
              </Button>
            </div>
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
                />
            </div>
            <Button onClick={handleGeneratePlan} disabled={!canGenerate} className="w-full">
              {planGenerationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Plan
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9 lg:overflow-y-auto lg:pr-2">
        {planGenerationMutation.isPending && (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <p>AI is analyzing your input and building the plan...</p>
            </div>
          </Card>
        )}
        {!planGenerationMutation.isPending && projectPlan ? (
          <ProjectPlanViewer projectPlan={projectPlan} />
        ) : (
          !planGenerationMutation.isPending && (
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
