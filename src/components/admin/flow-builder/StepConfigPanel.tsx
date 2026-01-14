/**
 * Step Configuration Panel
 * Week 3 - Day 1: Step Editor
 * 
 * Side panel for editing step configuration
 */

'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Save, GitBranch, Eye } from 'lucide-react';
import type { FlowStep } from '@/lib/models/flow-config';
import { MappingBuilder } from './MappingBuilder';
import { DataFlowDiagram } from './DataFlowDiagram';
import { VariableBrowser } from './VariableBrowser';

// ============================================================================
// Step Config Panel Component
// ============================================================================

interface StepConfigPanelProps {
  step: FlowStep;
  onUpdate: (step: FlowStep) => void;
  onClose: () => void;
  allSteps?: FlowStep[];
  flowConfig?: any;
}

export function StepConfigPanel({ step, onUpdate, onClose, allSteps = [], flowConfig }: StepConfigPanelProps) {
  const [editedStep, setEditedStep] = useState<FlowStep>(step);
  const [showDataFlow, setShowDataFlow] = useState(false);

  const handleSave = () => {
    onUpdate(editedStep);
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setEditedStep((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateConfig = (field: string, value: any) => {
    setEditedStep((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  const updateCondition = (field: string, value: any) => {
    setEditedStep((prev) => ({
      ...prev,
      condition: {
        ...prev.condition,
        [field]: value,
      },
    }));
  };

  const updateErrorHandling = (field: string, value: any) => {
    setEditedStep((prev) => ({
      ...prev,
      errorHandling: {
        ...prev.errorHandling,
        [field]: value,
      },
    }));
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Step</SheetTitle>
          <SheetDescription>
            Edit the configuration for this {editedStep.type} step
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="basic" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="mapping">Mapping</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Step Name</Label>
              <Input
                id="name"
                value={editedStep.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter step name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id">Step ID</Label>
              <Input
                id="id"
                value={editedStep.id}
                onChange={(e) => updateField('id', e.target.value)}
                placeholder="step_1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Step Type</Label>
              <Select
                value={editedStep.type}
                onValueChange={(value) => updateField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prompt">Prompt</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                  <SelectItem value="loop">Loop</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-4">
            {editedStep.type === 'prompt' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt Template</Label>
                  <Textarea
                    id="prompt"
                    value={editedStep.config.prompt || ''}
                    onChange={(e) => updateConfig('prompt', e.target.value)}
                    placeholder="Enter your prompt template with {{variables}}"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{{input.field}}`} to access input variables
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select
                      value={editedStep.config.model || 'gemini-2.0-flash-exp'}
                      onValueChange={(value) => updateConfig('model', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={editedStep.config.temperature || 0.7}
                      onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={editedStep.config.maxTokens || 2048}
                    onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
                  />
                </div>
              </>
            )}

            {editedStep.type === 'tool' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="toolName">Tool Name</Label>
                  <Input
                    id="toolName"
                    value={editedStep.config.toolName || ''}
                    onChange={(e) => updateConfig('toolName', e.target.value)}
                    placeholder="e.g., ragRetrieval, search"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parameters">Parameters (JSON)</Label>
                  <Textarea
                    id="parameters"
                    value={JSON.stringify(editedStep.config.parameters || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const params = JSON.parse(e.target.value);
                        updateConfig('parameters', params);
                      } catch (err) {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder='{"key": "value"}'
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}

            {editedStep.type === 'condition' && (
              <div className="space-y-2">
                <Label htmlFor="expression">Condition Expression</Label>
                <Textarea
                  id="expression"
                  value={editedStep.config.expression || ''}
                  onChange={(e) => updateConfig('expression', e.target.value)}
                  placeholder="input.userType === 'premium'"
                  rows={3}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  JavaScript-like expression (e.g., input.field === 'value')
                </p>
              </div>
            )}

            {editedStep.type === 'loop' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="iterateOver">Iterate Over</Label>
                  <Input
                    id="iterateOver"
                    value={editedStep.config.iterateOver || ''}
                    onChange={(e) => updateConfig('iterateOver', e.target.value)}
                    placeholder="items"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variable name containing the array to loop over
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxIterations">Max Iterations</Label>
                  <Input
                    id="maxIterations"
                    type="number"
                    value={editedStep.config.maxIterations || 10}
                    onChange={(e) => updateConfig('maxIterations', parseInt(e.target.value))}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Error Handling</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="continueOnError">Continue on Error</Label>
                <Switch
                  id="continueOnError"
                  checked={editedStep.errorHandling?.continueOnError || false}
                  onCheckedChange={(checked) => updateErrorHandling('continueOnError', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retries">Retries</Label>
                <Input
                  id="retries"
                  type="number"
                  min="0"
                  max="5"
                  value={editedStep.errorHandling?.retries || 0}
                  onChange={(e) => updateErrorHandling('retries', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback">Fallback Step ID</Label>
                <Input
                  id="fallback"
                  value={editedStep.errorHandling?.fallback || ''}
                  onChange={(e) => updateErrorHandling('fallback', e.target.value)}
                  placeholder="step_fallback"
                />
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Conditional Execution</h3>

              <div className="space-y-2">
                <Label htmlFor="conditionExpr">Condition Expression</Label>
                <Textarea
                  id="conditionExpr"
                  value={editedStep.condition?.expression || ''}
                  onChange={(e) => updateCondition('expression', e.target.value)}
                  placeholder="input.shouldExecute === true"
                  rows={2}
                  className="font-mono text-sm"
                />
              </div>
            </Card>
          </TabsContent>

          {/* Mapping Tab */}
          <TabsContent value="mapping" className="space-y-4">
            {/* Data Flow Visualization Toggle */}
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDataFlow(!showDataFlow)}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                {showDataFlow ? 'Hide' : 'Show'} Data Flow
              </Button>
            </div>

            {/* Data Flow Diagram */}
            {showDataFlow && (
              <DataFlowDiagram
                steps={allSteps}
                currentStepId={editedStep.id}
              />
            )}

            {/* Layout: Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Variable Browser */}
              <div className="lg:col-span-1">
                <VariableBrowser
                  steps={allSteps}
                  currentStepId={editedStep.id}
                  flowInputSchema={flowConfig?.inputSchema}
                />
              </div>

              {/* Right: Mapping Builders */}
              <div className="lg:col-span-2 space-y-4">
                {/* Input Mapping */}
                <MappingBuilder
                  type="input"
                  mappings={(editedStep as any).contextMapping?.input || {}}
                  onChange={(mappings) => {
                    setEditedStep((prev) => ({
                      ...prev,
                      contextMapping: {
                        ...(prev as any).contextMapping,
                        input: mappings,
                      },
                    } as FlowStep));
                  }}
                  stepId={editedStep.id}
                  allSteps={allSteps.map(s => ({ id: s.id, name: s.name }))}
                />

                {/* Output Mapping */}
                <MappingBuilder
                  type="output"
                  mappings={(editedStep as any).contextMapping?.output || {}}
                  onChange={(mappings) => {
                    setEditedStep((prev) => ({
                      ...prev,
                      contextMapping: {
                        ...(prev as any).contextMapping,
                        output: mappings,
                      },
                    } as FlowStep));
                  }}
                  stepId={editedStep.id}
                  allSteps={allSteps.map(s => ({ id: s.id, name: s.name }))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
