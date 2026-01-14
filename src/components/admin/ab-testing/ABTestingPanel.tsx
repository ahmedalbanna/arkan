/**
 * A/B Testing Panel
 * Week 4 - Day 1: A/B Testing UI
 * 
 * UI for creating and managing A/B tests
 */

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Play, Square, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ABExperiment } from '@/services/ab-testing-service';

// ============================================================================
// A/B Testing Panel
// ============================================================================

interface ABTestingPanelProps {
  flowId: string;
  stepId: string;
}

export function ABTestingPanel({ flowId, stepId }: ABTestingPanelProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch experiments
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['ab-experiments', flowId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/ab-tests?flowId=${flowId}`);
      if (!response.ok) throw new Error('Failed to fetch experiments');
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'secondary', label: 'Draft' },
      running: { variant: 'default', label: 'Running' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing</h2>
          <p className="text-muted-foreground">
            Optimize prompts with data-driven experiments
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreateExperimentForm
              flowId={flowId}
              stepId={stepId}
              onSuccess={() => {
                setShowCreateDialog(false);
                queryClient.invalidateQueries({ queryKey: ['ab-experiments'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Experiments List */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading experiments...</p>
        </Card>
      ) : experiments?.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No experiments yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            Create Your First Experiment
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiments?.map((experiment: ABExperiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Experiment Card
// ============================================================================

interface ExperimentCardProps {
  experiment: ABExperiment;
}

function ExperimentCard({ experiment }: ExperimentCardProps) {
  const queryClient = useQueryClient();
  const [showResults, setShowResults] = useState(false);

  const totalImpressions = experiment.variants.reduce(
    (sum, v) => sum + v.metrics.impressions,
    0
  );

  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/admin/ab-tests/${experiment.id}/start`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to start experiment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments'] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/admin/ab-tests/${experiment.id}/stop`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to stop experiment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-experiments'] });
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{experiment.name}</h3>
            <Badge variant="secondary">{experiment.status}</Badge>
          </div>
          {experiment.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {experiment.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {totalImpressions} total impressions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {experiment.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          )}
          {experiment.status === 'running' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowResults(!showResults)}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {showResults ? 'Hide' : 'View'} Results
          </Button>
        </div>
      </div>

      {/* Variants Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {experiment.variants.map((variant) => {
          const successRate =
            variant.metrics.impressions > 0
              ? (variant.metrics.successes / variant.metrics.impressions) * 100
              : 0;

          return (
            <Card key={variant.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{variant.name}</h4>
                <Badge variant="outline">{variant.traffic}%</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impressions:</span>
                  <span className="font-medium">{variant.metrics.impressions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">{successRate.toFixed(1)}%</span>
                </div>
                <Progress value={successRate} className="h-2" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Results */}
      {showResults && (
        <ExperimentResults experimentId={experiment.id} />
      )}
    </Card>
  );
}

// ============================================================================
// Experiment Results
// ============================================================================

interface ExperimentResultsProps {
  experimentId: string;
}

function ExperimentResults({ experimentId }: ExperimentResultsProps) {
  const { data: results, isLoading } = useQuery({
    queryKey: ['ab-results', experimentId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/ab-tests/${experimentId}/results`);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading results...</div>;
  }

  return (
    <div className="border-t pt-4 space-y-4">
      {/* Statistical Analysis */}
      {results?.statistical && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            {results.statistical.isSignificant ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold mb-2">Statistical Analysis</h4>
              <p className="text-sm mb-3">{results.recommendation}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Confidence Level:</span>
                  <span className="ml-2 font-medium">
                    {(results.statistical.confidenceLevel * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">P-Value:</span>
                  <span className="ml-2 font-medium">
                    {results.statistical.pValue.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Detailed Metrics Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant</TableHead>
            <TableHead>Impressions</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Avg Duration</TableHead>
            <TableHead>Avg Tokens</TableHead>
            <TableHead>Avg Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results?.results.map((result: any) => (
            <TableRow key={result.variantId}>
              <TableCell className="font-medium">
                {result.variantName}
                {result.variantId === results.winner.variantId && (
                  <Badge className="ml-2" variant="default">Winner</Badge>
                )}
              </TableCell>
              <TableCell>{result.impressions}</TableCell>
              <TableCell>{(result.successRate * 100).toFixed(1)}%</TableCell>
              <TableCell>{result.avgDuration.toFixed(0)}ms</TableCell>
              <TableCell>{Math.round(result.avgTokens)}</TableCell>
              <TableCell>${result.avgCost.toFixed(4)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
// Create Experiment Form
// ============================================================================

interface CreateExperimentFormProps {
  flowId: string;
  stepId: string;
  onSuccess: () => void;
}

function CreateExperimentForm({ flowId, stepId, onSuccess }: CreateExperimentFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState([
    { name: 'Control', prompt: '', traffic: 50 },
    { name: 'Variant A', prompt: '', traffic: 50 },
  ]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          flowId,
          stepId,
          variants,
        }),
      });
      if (!response.ok) throw new Error('Failed to create experiment');
      return response.json();
    },
    onSuccess,
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create A/B Test</DialogTitle>
        <DialogDescription>
          Test different prompt variants to optimize performance
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Experiment Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Test prompt temperature"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you're testing..."
            rows={2}
          />
        </div>

        {/* Variants */}
        <div className="space-y-3">
          <Label>Variants</Label>
          {variants.map((variant, index) => (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={variant.name}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].name = e.target.value;
                    setVariants(newVariants);
                  }}
                  placeholder="Variant name"
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={variant.traffic}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].traffic = parseInt(e.target.value);
                      setVariants(newVariants);
                    }}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <Textarea
                value={variant.prompt}
                onChange={(e) => {
                  const newVariants = [...variants];
                  newVariants[index].prompt = e.target.value;
                  setVariants(newVariants);
                }}
                placeholder="Prompt template..."
                rows={3}
              />
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setVariants([
              ...variants,
              { name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`, prompt: '', traffic: 0 },
            ]);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={() => createMutation.mutate()}
          disabled={!name || variants.length < 2 || createMutation.isPending}
        >
          Create Experiment
        </Button>
      </div>
    </>
  );
}
