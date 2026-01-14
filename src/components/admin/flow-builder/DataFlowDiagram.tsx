/**
 * Data Flow Diagram Component
 * Visual diagram showing how data flows between steps
 */

'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Database, 
  Zap, 
  Box,
  CircleDot,
  GitBranch,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { FlowStep } from '@/lib/models/flow-config';

// ============================================================================
// Types
// ============================================================================

interface DataFlowDiagramProps {
  steps: FlowStep[];
  currentStepId?: string;
  highlightedVariable?: string;
}

interface DataNode {
  id: string;
  type: 'input' | 'step' | 'variable' | 'output';
  label: string;
  stepName?: string;
  connections: string[];
  depth: number;
}

// ============================================================================
// Data Flow Diagram Component
// ============================================================================

export function DataFlowDiagram({ 
  steps, 
  currentStepId,
  highlightedVariable 
}: DataFlowDiagramProps) {
  
  // Build data flow graph
  const dataFlow = useMemo(() => {
    const nodes: DataNode[] = [];
    const edges: Array<{ from: string; to: string; label?: string }> = [];

    // Add flow input node
    nodes.push({
      id: 'flow-input',
      type: 'input',
      label: 'Flow Input',
      connections: [],
      depth: 0
    });

    // Process each step
    steps.forEach((step, index) => {
      const stepNode: DataNode = {
        id: step.id,
        type: 'step',
        label: step.name,
        stepName: step.name,
        connections: [],
        depth: index + 1
      };
      nodes.push(stepNode);

      // Process input mappings
      const inputMapping = (step as any).contextMapping?.input || (step as any).inputMapping || {};
      Object.entries(inputMapping).forEach(([key, value]) => {
        const sourceValue = value as string;
        
        // Determine source
        if (sourceValue.startsWith('input.')) {
          edges.push({
            from: 'flow-input',
            to: step.id,
            label: key
          });
        } else if (sourceValue.includes('.')) {
          // From another step
          const [sourceStepId] = sourceValue.split('.');
          edges.push({
            from: sourceStepId,
            to: step.id,
            label: key
          });
        } else {
          // From a variable
          edges.push({
            from: `var-${sourceValue}`,
            to: step.id,
            label: key
          });
        }
      });

      // Process output mappings
      const outputMapping = (step as any).contextMapping?.output || (step as any).outputMapping || {};
      Object.entries(outputMapping).forEach(([key, value]) => {
        const varId = `var-${value}`;
        
        // Add variable node if not exists
        if (!nodes.find(n => n.id === varId)) {
          nodes.push({
            id: varId,
            type: 'variable',
            label: value as string,
            connections: [],
            depth: index + 1.5
          });
        }

        edges.push({
          from: step.id,
          to: varId,
          label: key || 'output'
        });
      });
    });

    return { nodes, edges };
  }, [steps]);

  // Get icon for node type
  const getNodeIcon = (type: DataNode['type']) => {
    switch (type) {
      case 'input':
        return <Database className="w-4 h-4" />;
      case 'step':
        return <Zap className="w-4 h-4" />;
      case 'variable':
        return <Box className="w-4 h-4" />;
      case 'output':
        return <CircleDot className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  // Get color for node type
  const getNodeColor = (type: DataNode['type'], isHighlighted: boolean, isCurrent: boolean) => {
    if (isCurrent) return 'border-primary bg-primary/10';
    if (isHighlighted) return 'border-yellow-500 bg-yellow-500/10';
    
    switch (type) {
      case 'input':
        return 'border-blue-500 bg-blue-500/10';
      case 'step':
        return 'border-purple-500 bg-purple-500/10';
      case 'variable':
        return 'border-green-500 bg-green-500/10';
      case 'output':
        return 'border-orange-500 bg-orange-500/10';
      default:
        return 'border-muted bg-muted/10';
    }
  };

  // Simplified view for complex flows
  if (steps.length > 5) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Data Flow Overview</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-2 rounded-lg border-2 min-w-[120px] text-center",
              "border-blue-500 bg-blue-500/10"
            )}>
              <Database className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-semibold">Flow Input</div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className={cn(
              "px-3 py-2 rounded-lg border-2 min-w-[120px] text-center",
              "border-purple-500 bg-purple-500/10"
            )}>
              <Zap className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-semibold">{steps.length} Steps</div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className={cn(
              "px-3 py-2 rounded-lg border-2 min-w-[120px] text-center",
              "border-green-500 bg-green-500/10"
            )}>
              <Box className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-semibold">Variables</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs font-semibold mb-2">Steps:</div>
            <div className="space-y-1">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded",
                    currentStepId === step.id && "bg-primary/10 border border-primary"
                  )}
                >
                  <Badge variant="outline" className="w-8 justify-center">
                    {index + 1}
                  </Badge>
                  <Zap className="w-3 h-3" />
                  <span className="font-mono">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Detailed view for small flows
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold">Data Flow</h3>
      </div>

      <div className="space-y-4">
        {/* Flow Input */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "px-4 py-3 rounded-lg border-2 min-w-[150px] text-center",
            getNodeColor('input', false, false)
          )}>
            <Database className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-semibold">Flow Input</div>
            <div className="text-xs text-muted-foreground">Initial data</div>
          </div>
        </div>

        {/* Steps and Variables */}
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const inputMapping = (step as any).contextMapping?.input || (step as any).inputMapping || {};
          const outputMapping = (step as any).contextMapping?.output || (step as any).outputMapping || {};
          
          return (
            <div key={step.id} className="space-y-3">
              {/* Arrow down */}
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>

              {/* Step Node */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "px-4 py-3 rounded-lg border-2 min-w-[150px] text-center transition-all",
                  getNodeColor('step', false, isCurrent)
                )}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Step {index + 1}
                    </Badge>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-semibold font-mono">{step.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.type}
                  </div>
                </div>

                {/* Input/Output Badges */}
                <div className="flex gap-4 mt-3">
                  {/* Inputs */}
                  {Object.keys(inputMapping).length > 0 && (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Inputs:</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {Object.entries(inputMapping).slice(0, 3).map(([key, value]) => (
                          <Badge 
                            key={key} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            <code>{key}</code>
                          </Badge>
                        ))}
                        {Object.keys(inputMapping).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{Object.keys(inputMapping).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Outputs */}
                  {Object.keys(outputMapping).length > 0 && (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Outputs:</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {Object.entries(outputMapping).slice(0, 3).map(([key, value]) => (
                          <Badge 
                            key={key} 
                            variant="secondary" 
                            className="text-xs bg-green-500/20"
                          >
                            <code>{value as string}</code>
                          </Badge>
                        ))}
                        {Object.keys(outputMapping).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{Object.keys(outputMapping).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Final Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
        </div>

        {/* Flow Output */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "px-4 py-3 rounded-lg border-2 min-w-[150px] text-center",
            "border-orange-500 bg-orange-500/10"
          )}>
            <CircleDot className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-semibold">Flow Output</div>
            <div className="text-xs text-muted-foreground">Final result</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <div className="text-xs font-semibold mb-2">Legend:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-500/10" />
            <span>Input</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-purple-500 bg-purple-500/10" />
            <span>Step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/10" />
            <span>Variable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-primary bg-primary/10" />
            <span>Current</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
