
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Sparkles, GanttChartSquare, BrainCircuit, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProjectPlanViewer from './ProjectPlanViewer';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useReportStore } from '@/hooks/useReportStore';
import { useMutation } from '@tanstack/react-query';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';

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
  const { t } = useLocalization();
  const { toast } = useToast();
  const { firebaseUser, userProfile } = useAuth();
  const { proposal, projectIdea } = useBuilderStore();
  const { projectPlan } = useProjectPlanStore();
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  const planGenerationMutation = useGenerateProjectPlan();

  useEffect(() => {
    // Pre-fill from proposal if available
    if (proposal) {
        setDescription(String(proposal.objective) || '');
        setDeliverables(Array.isArray(proposal.expected_outcome) ? proposal.expected_outcome.join('\n') : String(proposal.expected_outcome) || '');
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

  const creditCost = 2;
  const isProcessing = planGenerationMutation.isPending || suggestionMutation.isPending;
  const canGenerate = (!!description.trim() && !!deliverables.trim()) && !isProcessing && (userProfile?.credits ?? 0) >= creditCost;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
         {isPanelCollapsed && (
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
                <Button
                    variant="secondary"
                    className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                    onClick={() => setIsPanelCollapsed(false)}
                >
                    <PanelRightOpen className="h-5 w-5 mb-2" />
                    {t('builder.projectPlan.title')}
                </Button>
            </div>
        )}
      <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('builder.projectPlan.title')}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => suggestionMutation.mutate()} disabled={!proposal || isProcessing}>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    {t('builder.projectPlan.aiSuggest')}
                </Button>
                 <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setIsPanelCollapsed(true)}>
                    <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>{t('builder.projectPlan.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="plan-description">{t('builder.projectPlan.projectDescriptionLabel')}</Label>
                <Textarea 
                    id="plan-description"
                    placeholder={t('builder.projectPlan.projectDescriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    disabled={isProcessing}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="plan-deliverables">{t('builder.projectPlan.keyDeliverablesLabel')}</Label>
                <Textarea 
                    id="plan-deliverables"
                    placeholder={t('builder.projectPlan.keyDeliverablesPlaceholder')}
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    rows={4}
                    disabled={isProcessing}
                />
            </div>
            <Button onClick={handleGeneratePlan} disabled={!canGenerate} className="w-full">
              {planGenerationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {t('builder.projectPlan.generateButton', { creditCost })}
            </Button>
          </CardContent>
        </Card>
      </div>
       <div className={cn("lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
        {planGenerationMutation.isPending && (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <p>{t('builder.projectPlan.generatingToast')}</p>
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
                <h3 className="text-lg font-semibold">{t('builder.projectPlan.emptyStateTitle')}</h3>
                <p>{t('builder.projectPlan.emptyStateDescription')}</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
