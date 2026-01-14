/**
 * Step Node Component
 * Week 3 - Day 1: Visual Step Representation
 * 
 * Individual step node for the flow builder
 */

'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Wrench,
  GitBranch,
  Repeat,
  Layers,
  Settings,
  Trash2,
} from 'lucide-react';
import type { FlowStep } from '@/lib/models/flow-config';

// ============================================================================
// Step Node Component
// ============================================================================

interface StepNodeData {
  step: FlowStep;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function StepNode({ data }: NodeProps<StepNodeData>) {
  const { step, onEdit, onDelete } = data;

  // Get icon based on step type
  const getStepIcon = () => {
    switch (step.type) {
      case 'prompt':
        return <MessageSquare className="w-4 h-4" />;
      case 'tool':
        return <Wrench className="w-4 h-4" />;
      case 'condition':
        return <GitBranch className="w-4 h-4" />;
      case 'loop':
        return <Repeat className="w-4 h-4" />;
      case 'parallel':
        return <Layers className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get color based on step type
  const getStepColor = () => {
    switch (step.type) {
      case 'prompt':
        return 'bg-blue-500';
      case 'tool':
        return 'bg-green-500';
      case 'condition':
        return 'bg-amber-500';
      case 'loop':
        return 'bg-purple-500';
      case 'parallel':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />

      <Card className="min-w-[200px] max-w-[300px] shadow-lg">
        {/* Header */}
        <div className={`${getStepColor()} px-3 py-2 rounded-t-lg flex items-center justify-between`}>
          <div className="flex items-center gap-2 text-white">
            {getStepIcon()}
            <span className="font-medium text-sm">
              {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Settings className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div>
            <p className="font-medium text-sm">{step.name}</p>
            <p className="text-xs text-muted-foreground">ID: {step.id}</p>
          </div>

          {/* Step-specific info */}
          {step.type === 'prompt' && step.config.prompt && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {step.config.prompt.substring(0, 60)}...
            </p>
          )}

          {step.type === 'tool' && step.config.toolName && (
            <Badge variant="secondary" className="text-xs">
              {step.config.toolName}
            </Badge>
          )}

          {step.type === 'condition' && step.condition?.expression && (
            <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
              {step.condition.expression}
            </p>
          )}

          {step.type === 'loop' && step.config.iterateOver && (
            <p className="text-xs text-muted-foreground">
              Loop over: {step.config.iterateOver}
            </p>
          )}

          {/* Error handling badge */}
          {step.errorHandling && (
            <Badge variant="outline" className="text-xs">
              {step.errorHandling.retries ? `Retries: ${step.errorHandling.retries}` : 'Error Handling'}
            </Badge>
          )}

          {/* Condition badge */}
          {step.condition && (
            <Badge variant="outline" className="text-xs">
              Conditional
            </Badge>
          )}
        </div>
      </Card>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </>
  );
}
