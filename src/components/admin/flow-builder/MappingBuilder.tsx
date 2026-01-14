/**
 * Mapping Builder Component
 * Enhanced UI for building input/output mappings with visual aids
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  Info,
  Code,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/cn';


// ============================================================================
// Types
// ============================================================================

interface MappingEntry {
  key: string;
  value: string;
  id: string;
}

interface MappingBuilderProps {
  type: 'input' | 'output';
  mappings: Record<string, string>;
  onChange: (mappings: Record<string, string>) => void;
  availableVariables?: string[];
  stepId?: string;
  allSteps?: Array<{ id: string; name: string }>;
}

// ============================================================================
// Mapping Builder Component
// ============================================================================

export function MappingBuilder({
  type,
  mappings,
  onChange,
  availableVariables = [],
  stepId,
  allSteps = []
}: MappingBuilderProps) {
  const [entries, setEntries] = useState<MappingEntry[]>(() => 
    Object.entries(mappings).map(([key, value], index) => ({
      key,
      value,
      id: `${index}-${Date.now()}`
    }))
  );
  const [showJson, setShowJson] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Update parent when entries change
  const updateMappings = (newEntries: MappingEntry[]) => {
    const newMappings = newEntries.reduce((acc, entry) => {
      if (entry.key && entry.value) {
        acc[entry.key] = entry.value;
      }
      return acc;
    }, {} as Record<string, string>);
    onChange(newMappings);
  };

  // Add new entry
  const addEntry = () => {
    const newEntry: MappingEntry = {
      key: '',
      value: '',
      id: `${Date.now()}`
    };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
  };

  // Remove entry
  const removeEntry = (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    updateMappings(newEntries);
  };

  // Update entry
  const updateEntry = (id: string, field: 'key' | 'value', newValue: string) => {
    const newEntries = entries.map(e => 
      e.id === id ? { ...e, [field]: newValue } : e
    );
    setEntries(newEntries);
    updateMappings(newEntries);
  };

  // Copy variable to clipboard
  const copyVariable = (variable: string, id: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get variable suggestions
  const getVariableSuggestions = () => {
    if (type === 'input') {
      const suggestions = ['input.*', ...availableVariables];
      // Add previous steps
      if (stepId && allSteps.length > 0) {
        const currentIndex = allSteps.findIndex(s => s.id === stepId);
        const previousSteps = allSteps.slice(0, currentIndex);
        previousSteps.forEach(step => {
          suggestions.push(`${step.id}.output`);
          suggestions.push(`${step.id}.*`);
        });
      }
      return suggestions;
    } else {
      // For output mapping, suggest simple variable names
      return ['result', 'data', 'content', 'analysis', 'summary'];
    }
  };

  const suggestions = getVariableSuggestions();

  // Examples based on type
  const examples = type === 'input' 
    ? [
        { key: 'content', value: 'step-1.output', desc: 'Use output from previous step' },
        { key: 'query', value: 'input.question', desc: 'Use flow input field' },
        { key: 'settings', value: 'globalSettings', desc: 'Use context variable' }
      ]
    : [
        { key: '', value: 'fullResult', desc: 'Save entire output' },
        { key: 'result', value: 'generatedContent', desc: 'Save specific field' },
        { key: 'metadata.score', value: 'qualityScore', desc: 'Save nested field' }
      ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">
            {type === 'input' ? 'Input Mapping' : 'Output Mapping'}
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p className="font-semibold mb-1">
                  {type === 'input' ? 'Input Mapping' : 'Output Mapping'}
                </p>
                <p className="text-sm">
                  {type === 'input' 
                    ? 'Map context variables to step inputs. Use variables from previous steps or flow inputs.'
                    : 'Map step outputs to context variables. These can be used by subsequent steps.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Visual
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                JSON
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        {type === 'input' 
          ? '← Map context variables to this step\'s inputs'
          : '→ Map this step\'s outputs to context variables'}
      </p>

      {/* JSON View */}
      {showJson ? (
        <Card className="p-4">
          <pre className="text-xs font-mono overflow-auto max-h-64">
            {JSON.stringify(mappings, null, 2)}
          </pre>
        </Card>
      ) : (
        <>
          {/* Mapping Entries */}
          <div className="space-y-3">
            {entries.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  No mappings defined yet
                </p>
                <Button onClick={addEntry} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Mapping
                </Button>
              </Card>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Source/Key Field */}
                    <div className="flex-1">
                      <Label className="text-xs mb-1">
                        {type === 'input' ? 'Step Input' : 'Step Output'}
                      </Label>
                      <Input
                        value={entry.key}
                        onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
                        placeholder={type === 'input' ? 'fieldName' : 'output.field or ""'}
                        className="font-mono text-sm"
                      />
                    </div>

                    {/* Arrow */}
                    <div className="flex items-end pb-2">
                      <ArrowRight className={cn(
                        "w-5 h-5",
                        type === 'input' ? "text-blue-500" : "text-green-500"
                      )} />
                    </div>

                    {/* Target/Value Field */}
                    <div className="flex-1">
                      <Label className="text-xs mb-1">
                        {type === 'input' ? 'Context Variable' : 'Save As'}
                      </Label>
                      <Input
                        value={entry.value}
                        onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                        placeholder={type === 'input' ? 'step-1.output or input.field' : 'variableName'}
                        className="font-mono text-sm"
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="flex items-end pb-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(entry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Add Button */}
          {entries.length > 0 && (
            <Button onClick={addEntry} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Mapping
            </Button>
          )}
        </>
      )}

      {/* Variable Suggestions */}
      {!showJson && suggestions.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">
            {type === 'input' ? 'Available Variables' : 'Suggested Names'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 10).map((variable, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => copyVariable(variable, `suggestion-${index}`)}
                    >
                      <code className="text-xs">{variable}</code>
                      {copiedId === `suggestion-${index}` ? (
                        <Check className="w-3 h-3 ml-1" />
                      ) : (
                        <Copy className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Click to copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </Card>
      )}

      {/* Examples */}
      {!showJson && (
        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Examples
          </h4>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div key={index} className="text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <code className="bg-background px-2 py-1 rounded">
                    {example.key || '""'}
                  </code>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <code className="bg-background px-2 py-1 rounded">
                    {example.value}
                  </code>
                </div>
                <p className="text-muted-foreground ml-1">{example.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
