/**
 * Variable Browser Component
 * Browse and select available variables from context
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Database,
  Zap,
  Box,
  FileText,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { FlowStep } from '@/lib/models/flow-config';

// ============================================================================
// Types
// ============================================================================

interface Variable {
  name: string;
  path: string;
  type: 'input' | 'step' | 'context';
  source?: string;
  description?: string;
  children?: Variable[];
}

interface VariableBrowserProps {
  steps: FlowStep[];
  currentStepId?: string;
  flowInputSchema?: any;
  onSelectVariable?: (path: string) => void;
}

// ============================================================================
// Variable Browser Component
// ============================================================================

export function VariableBrowser({
  steps,
  currentStepId,
  flowInputSchema,
  onSelectVariable
}: VariableBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['input', 'steps']));
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Get current step index
  const currentStepIndex = currentStepId 
    ? steps.findIndex(s => s.id === currentStepId)
    : steps.length;

  // Build variable tree
  const variables = useMemo(() => {
    const vars: Variable[] = [];

    // 1. Flow Inputs
    const inputVars: Variable[] = [];
    if (flowInputSchema && typeof flowInputSchema === 'object') {
      if (flowInputSchema.shape) {
        // Zod schema
        Object.keys(flowInputSchema.shape).forEach(key => {
          inputVars.push({
            name: key,
            path: `input.${key}`,
            type: 'input',
            source: 'Flow Input',
            description: `Input field: ${key}`
          });
        });
      } else {
        // Generic object
        Object.keys(flowInputSchema).forEach(key => {
          inputVars.push({
            name: key,
            path: `input.${key}`,
            type: 'input',
            source: 'Flow Input'
          });
        });
      }
    }

    if (inputVars.length > 0) {
      vars.push({
        name: 'Flow Inputs',
        path: 'input',
        type: 'input',
        description: 'Variables from flow input',
        children: inputVars
      });
    } else {
      vars.push({
        name: 'Flow Inputs',
        path: 'input.*',
        type: 'input',
        description: 'Use input.* to access any input field'
      });
    }

    // 2. Previous Steps
    const previousSteps = steps.slice(0, currentStepIndex);
    if (previousSteps.length > 0) {
      const stepVars: Variable[] = previousSteps.map(step => {
        const children: Variable[] = [
          {
            name: 'output',
            path: `${step.id}.output`,
            type: 'step',
            source: step.name,
            description: 'Complete step output'
          }
        ];

        // Add output mappings as children
        const outputMapping = (step as any).contextMapping?.output || (step as any).outputMapping || {};
        Object.entries(outputMapping).forEach(([key, value]) => {
          if (key) {
            children.push({
              name: key,
              path: `${step.id}.${key}`,
              type: 'step',
              source: step.name,
              description: `Output field: ${key}`
            });
          }
        });

        return {
          name: step.name,
          path: step.id,
          type: 'step',
          source: `Step ${previousSteps.indexOf(step) + 1}`,
          children
        };
      });

      vars.push({
        name: 'Previous Steps',
        path: 'steps',
        type: 'step',
        description: 'Variables from previous steps',
        children: stepVars
      });
    }

    // 3. Context Variables (from output mappings)
    const contextVars: Variable[] = [];
    previousSteps.forEach(step => {
      const outputMapping = (step as any).contextMapping?.output || (step as any).outputMapping || {};
      Object.values(outputMapping).forEach(varName => {
        if (!contextVars.find(v => v.name === varName)) {
          contextVars.push({
            name: varName as string,
            path: varName as string,
            type: 'context',
            source: step.name,
            description: `Saved by ${step.name}`
          });
        }
      });
    });

    if (contextVars.length > 0) {
      vars.push({
        name: 'Context Variables',
        path: 'context',
        type: 'context',
        description: 'Variables saved to context',
        children: contextVars
      });
    }

    return vars;
  }, [steps, currentStepIndex, flowInputSchema]);

  // Filter variables
  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return variables;

    const query = searchQuery.toLowerCase();
    
    const filterNode = (node: Variable): Variable | null => {
      const matchesSearch = 
        node.name.toLowerCase().includes(query) ||
        node.path.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query);

      if (node.children) {
        const filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(Boolean) as Variable[];
        
        if (matchesSearch || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
      } else if (matchesSearch) {
        return node;
      }

      return null;
    };

    return variables
      .map(v => filterNode(v))
      .filter(Boolean) as Variable[];
  }, [variables, searchQuery]);

  // Toggle group expansion
  const toggleGroup = (path: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedGroups(newExpanded);
  };

  // Copy variable path
  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
    
    if (onSelectVariable) {
      onSelectVariable(path);
    }
  };

  // Get icon for variable type
  const getIcon = (type: Variable['type']) => {
    switch (type) {
      case 'input':
        return <Database className="w-4 h-4" />;
      case 'step':
        return <Zap className="w-4 h-4" />;
      case 'context':
        return <Box className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Get color for variable type
  const getColor = (type: Variable['type']) => {
    switch (type) {
      case 'input':
        return 'text-blue-500';
      case 'step':
        return 'text-purple-500';
      case 'context':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  // Render variable node
  const renderVariable = (variable: Variable, depth: number = 0) => {
    const hasChildren = variable.children && variable.children.length > 0;
    const isExpanded = expandedGroups.has(variable.path);
    const isCopied = copiedPath === variable.path;

    return (
      <div key={variable.path} style={{ paddingLeft: `${depth * 12}px` }}>
        {hasChildren ? (
          <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(variable.path)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start mb-1 hover:bg-muted"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
                <span className={cn("mr-2", getColor(variable.type))}>
                  {getIcon(variable.type)}
                </span>
                <span className="font-semibold">{variable.name}</span>
                {variable.source && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {variable.source}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {variable.children?.map(child => renderVariable(child, depth + 1))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mb-1 hover:bg-muted group"
            onClick={() => copyPath(variable.path)}
          >
            <span className={cn("mr-2", getColor(variable.type))}>
              {getIcon(variable.type)}
            </span>
            <code className="text-xs flex-1 text-left">{variable.name}</code>
            <div className="ml-auto flex items-center gap-1">
              {variable.source && (
                <Badge variant="outline" className="text-xs">
                  {variable.source}
                </Badge>
              )}
              {isCopied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </Button>
        )}
        {variable.description && !hasChildren && (
          <p className="text-xs text-muted-foreground px-4 mb-2">
            {variable.description}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold mb-1">Available Variables</h3>
          <p className="text-xs text-muted-foreground">
            Click to copy variable path
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Variables List */}
        <ScrollArea className="h-[400px] pr-4">
          {filteredVariables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No variables found' : 'No variables available yet'}
              </p>
              {!searchQuery && (
                <p className="text-xs mt-1">
                  Add steps to see their outputs here
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredVariables.map(variable => renderVariable(variable))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Reference */}
        <Card className="p-3 bg-muted/50">
          <div className="text-xs space-y-2">
            <div className="font-semibold mb-2">Quick Reference:</div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              <code>input.field</code>
              <span className="text-muted-foreground">- Flow input</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              <code>step-1.output</code>
              <span className="text-muted-foreground">- Step output</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              <code>variableName</code>
              <span className="text-muted-foreground">- Context var</span>
            </div>
          </div>
        </Card>

        {/* Type Legend */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-blue-500" />
            <span>Input</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-500" />
            <span>Step</span>
          </div>
          <div className="flex items-center gap-1">
            <Box className="w-3 h-3 text-green-500" />
            <span>Context</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
