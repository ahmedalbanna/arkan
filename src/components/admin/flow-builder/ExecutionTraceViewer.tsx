/**
 * Execution Trace Viewer
 * Week 3 - Day 2: Trace Viewer
 * 
 * View detailed execution traces with step-by-step breakdown
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
} from 'lucide-react';
import type { ExecutionTrace, StepTrace } from '@/services/execution-trace-service';

// ============================================================================
// Execution Trace Viewer Component
// ============================================================================

interface ExecutionTraceViewerProps {
  trace: ExecutionTrace;
}

export function ExecutionTraceViewer({ trace }: ExecutionTraceViewerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      skipped: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Execution Trace</h2>
              {getStatusBadge(trace.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Trace ID: {trace.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Flow: {trace.flowId} v{trace.flowVersion}
            </p>
          </div>

          <div className="text-right text-sm">
            <p className="text-muted-foreground">
              Started: {new Date(trace.startTime).toLocaleString()}
            </p>
            {trace.endTime && (
              <p className="text-muted-foreground">
                Ended: {new Date(trace.endTime).toLocaleString()}
              </p>
            )}
            {trace.duration && (
              <p className="font-medium">
                Duration: {formatDuration(trace.duration)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Tokens</p>
          <p className="text-2xl font-bold">{trace.metrics.totalTokens.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">${trace.metrics.totalCost.toFixed(4)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Cache Hits</p>
          <p className="text-2xl font-bold">{trace.metrics.cacheHits}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Cache Misses</p>
          <p className="text-2xl font-bold">{trace.metrics.cacheMisses}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="steps" className="w-full">
        <TabsList>
          <TabsTrigger value="steps">Steps ({trace.steps.length})</TabsTrigger>
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
          {trace.error && <TabsTrigger value="error">Error</TabsTrigger>}
        </TabsList>

        {/* Steps Tab */}
        <TabsContent value="steps">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {trace.steps.map((step, index) => (
                <StepTraceCard
                  key={step.stepId}
                  step={step}
                  index={index}
                  expanded={expandedSteps.has(step.stepId)}
                  onToggle={() => toggleStep(step.stepId)}
                />
              ))}

              {trace.steps.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  No steps recorded yet
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Input Tab */}
        <TabsContent value="input">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Input Data</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(trace.input, null, 2))}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(trace.input, null, 2)}
            </pre>
          </Card>
        </TabsContent>

        {/* Output Tab */}
        <TabsContent value="output">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Output Data</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(trace.output, null, 2))}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            {trace.output ? (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(trace.output, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground text-center py-8">No output available</p>
            )}
          </Card>
        </TabsContent>

        {/* Context Tab */}
        <TabsContent value="context">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Execution Context</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(trace.context, null, 2))}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(trace.context, null, 2)}
            </pre>
          </Card>
        </TabsContent>

        {/* Error Tab */}
        {trace.error && (
          <TabsContent value="error">
            <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4">
                Error Details
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Message:</span> {trace.error.message}
                </p>
                {trace.error.name && (
                  <p className="text-sm">
                    <span className="font-medium">Type:</span> {trace.error.name}
                  </p>
                )}
                {trace.error.stack && (
                  <div className="mt-4">
                    <p className="font-medium text-sm mb-2">Stack Trace:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                      {trace.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ============================================================================
// Step Trace Card Component
// ============================================================================

interface StepTraceCardProps {
  step: StepTrace;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

function StepTraceCard({ step, index, expanded, onToggle }: StepTraceCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="p-4">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              #{index + 1}
            </span>
            {getStatusIcon(step.status)}
          </div>

          <div className="flex-1">
            <h4 className="font-medium">{step.stepName}</h4>
            <p className="text-sm text-muted-foreground">ID: {step.stepId}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>Duration: {formatDuration(step.duration)}</span>
              {step.metrics?.tokens && (
                <span>Tokens: {step.metrics.tokens}</span>
              )}
              {step.metrics?.cost && (
                <span>Cost: ${step.metrics.cost.toFixed(4)}</span>
              )}
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {step.input && (
            <div>
              <p className="text-sm font-medium mb-2">Input:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}

          {step.output && (
            <div>
              <p className="text-sm font-medium mb-2">Output:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}

          {step.error && (
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                Error:
              </p>
              <p className="text-sm">{step.error.message || String(step.error)}</p>
            </div>
          )}

          {step.metrics && (
            <div>
              <p className="text-sm font-medium mb-2">Metrics:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(step.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
