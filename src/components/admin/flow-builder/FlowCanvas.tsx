/**
 * Flow Canvas Component
 * 
 * Visual drag-and-drop canvas for building flows with connections between steps.
 * Uses React Flow for the visualization and interaction.
 */

'use client';

import React, { useCallback, useState, useMemo } from 'react';
import { FlowStep, StepType } from '@/lib/models/flow-config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Database, 
  Wrench, 
  FileText, 
  GitBranch, 
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FlowCanvasProps {
  steps: FlowStep[];
  selectedStepId?: string;
  onStepSelect?: (stepId: string) => void;
  onStepAdd?: (afterStepId?: string) => void;
  onStepDelete?: (stepId: string) => void;
  onStepReorder?: (stepId: string, newIndex: number) => void;
  readOnly?: boolean;
}

interface StepNodeProps {
  step: FlowStep;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAddAfter: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  readOnly?: boolean;
}

// Step type to icon mapping
const stepTypeConfig: Record<StepType, { icon: React.ElementType; color: string; bgColor: string }> = {
  GENERATE: { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950' },
  RETRIEVE: { icon: Database, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  TOOL: { icon: Wrench, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  FORMAT: { icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' },
  CONDITION: { icon: GitBranch, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' },
  LOOP: { icon: RefreshCw, color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950' },
};

function StepNode({
  step,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}: StepNodeProps) {
  const config = stepTypeConfig[step.type];
  const Icon = config.icon;

  return (
    <div className="relative group">
      {/* Connection line to previous step */}
      {!isFirst && (
        <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 flex flex-col items-center">
          <ChevronRight className="w-5 h-5 rotate-90 text-muted-foreground" />
        </div>
      )}

      {/* Step Card */}
      <Card
        className={cn(
          'relative cursor-pointer transition-all hover:shadow-md',
          isSelected && 'ring-2 ring-primary shadow-lg',
          config.bgColor
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Step Icon */}
            <div className={cn('p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm')}>
              <Icon className={cn('w-5 h-5', config.color)} />
            </div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{step.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {step.type}
                </Badge>
              </div>
              {step.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {step.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">
                  Step {index + 1}
                </Badge>
                {step.config.promptName && (
                  <Badge variant="secondary" className="text-xs">
                    {step.config.promptName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Step Actions */}
            {!readOnly && (
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                  title="Configure"
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Step Button (appears between steps) */}
      {!readOnly && (
        <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 rounded-full bg-background shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onAddAfter();
            }}
            title="Add step after"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function FlowCanvas({
  steps,
  selectedStepId,
  onStepSelect,
  onStepAdd,
  onStepDelete,
  onStepReorder,
  readOnly = false,
}: FlowCanvasProps) {
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);

  const handleStepDragStart = useCallback((stepId: string) => {
    setDraggedStepId(stepId);
  }, []);

  const handleStepDragEnd = useCallback(() => {
    setDraggedStepId(null);
  }, []);

  const handleStepDrop = useCallback((targetIndex: number) => {
    if (draggedStepId && onStepReorder) {
      onStepReorder(draggedStepId, targetIndex);
    }
    setDraggedStepId(null);
  }, [draggedStepId, onStepReorder]);

  return (
    <div className="relative w-full h-full overflow-auto p-8">
      {steps.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="p-6 rounded-full bg-muted/50 mb-4">
            <Zap className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No steps yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Start building your flow by adding steps from the step library.
          </p>
          {!readOnly && onStepAdd && (
            <Button onClick={() => onStepAdd()}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Step
            </Button>
          )}
        </div>
      ) : (
        // Steps List
        <div className="max-w-2xl mx-auto space-y-12">
          {steps.map((step, index) => (
            <StepNode
              key={step.id}
              step={step}
              index={index}
              isSelected={selectedStepId === step.id}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
              onSelect={() => onStepSelect?.(step.id)}
              onDelete={() => onStepDelete?.(step.id)}
              onAddAfter={() => onStepAdd?.(step.id)}
              onMoveUp={() => onStepReorder?.(step.id, index - 1)}
              onMoveDown={() => onStepReorder?.(step.id, index + 1)}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {/* Flow Statistics */}
      {steps.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-medium">{steps.length}</span>
              <span className="text-muted-foreground">steps</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {steps.filter(s => s.type === 'GENERATE').length}
              </span>
              <span className="text-muted-foreground">generate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {steps.filter(s => s.type === 'RETRIEVE').length}
              </span>
              <span className="text-muted-foreground">retrieve</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
