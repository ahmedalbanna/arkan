/**
 * Step Editor Component
 * 
 * Configuration panel for editing individual flow steps with type-specific options.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FlowStep, StepType, GenerateStepConfig, RetrieveStepConfig, ToolStepConfig, FormatStepConfig, ConditionStepConfig, LoopStepConfig } from '@/lib/models/flow-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, X, Plus, Trash2, Code, TestTube } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StepEditorProps {
  step: FlowStep;
  onSave: (step: FlowStep) => void;
  onCancel: () => void;
  availablePrompts?: Array<{ name: string; displayName: string }>;
  availableTools?: Array<{ name: string; description: string }>;
}

export function StepEditor({
  step,
  onSave,
  onCancel,
  availablePrompts = [],
  availableTools = [],
}: StepEditorProps) {
  const [editedStep, setEditedStep] = useState<FlowStep>(step);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    setEditedStep(step);
  }, [step]);

  const handleSave = () => {
    onSave(editedStep);
  };

  const updateStepField = <K extends keyof FlowStep>(field: K, value: FlowStep[K]) => {
    setEditedStep({ ...editedStep, [field]: value });
  };

  const updateConfig = (updates: Partial<any>) => {
    setEditedStep({
      ...editedStep,
      config: { ...editedStep.config, ...updates },
    });
  };

  // Render type-specific configuration
  const renderTypeSpecificConfig = () => {
    switch (editedStep.type) {
      case 'GENERATE':
        return <GenerateStepEditor config={editedStep.config as GenerateStepConfig} updateConfig={updateConfig} availablePrompts={availablePrompts} />;
      case 'RETRIEVE':
        return <RetrieveStepEditor config={editedStep.config as RetrieveStepConfig} updateConfig={updateConfig} />;
      case 'TOOL':
        return <ToolStepEditor config={editedStep.config as ToolStepConfig} updateConfig={updateConfig} availableTools={availableTools} />;
      case 'FORMAT':
        return <FormatStepEditor config={editedStep.config as FormatStepConfig} updateConfig={updateConfig} />;
      case 'CONDITION':
        return <ConditionStepEditor config={editedStep.config as ConditionStepConfig} updateConfig={updateConfig} />;
      case 'LOOP':
        return <LoopStepEditor config={editedStep.config as LoopStepConfig} updateConfig={updateConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Badge>{editedStep.type}</Badge>
          <h3 className="font-semibold">Configure Step</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="step-name">Step Name</Label>
                <Input
                  id="step-name"
                  value={editedStep.name}
                  onChange={(e) => updateStepField('name', e.target.value)}
                  placeholder="e.g., Generate Introduction"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-description">Description</Label>
                <Textarea
                  id="step-description"
                  value={editedStep.description || ''}
                  onChange={(e) => updateStepField('description', e.target.value)}
                  placeholder="Describe what this step does..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-type">Step Type</Label>
                <Select
                  value={editedStep.type}
                  onValueChange={(value: StepType) => updateStepField('type', value)}
                >
                  <SelectTrigger id="step-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERATE">Generate - Generate text with LLM</SelectItem>
                    <SelectItem value="RETRIEVE">Retrieve - Fetch context from RAG</SelectItem>
                    <SelectItem value="TOOL">Tool - Execute a tool</SelectItem>
                    <SelectItem value="FORMAT">Format - Format output</SelectItem>
                    <SelectItem value="CONDITION">Condition - Conditional branching</SelectItem>
                    <SelectItem value="LOOP">Loop - Iterative processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4">
              {renderTypeSpecificConfig()}
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Timeout (seconds)</Label>
                    <p className="text-xs text-muted-foreground">Maximum execution time for this step (TOOL steps only)</p>
                  </div>
                  <Input
                    type="number"
                    className="w-24"
                    value={(editedStep.config.type === 'TOOL' && editedStep.config.timeout) || 30}
                    onChange={(e) => {
                      if (editedStep.config.type === 'TOOL') {
                        updateConfig({ timeout: parseInt(e.target.value) });
                      }
                    }}
                    min={1}
                    max={300}
                    disabled={editedStep.config.type !== 'TOOL'}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Retries</Label>
                    <p className="text-xs text-muted-foreground">Number of retry attempts on failure</p>
                  </div>
                  <Input
                    type="number"
                    className="w-24"
                    value={editedStep.retryCount || 0}
                    onChange={(e) => updateStepField('retryCount', parseInt(e.target.value))}
                    min={0}
                    max={5}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Error Handling</Label>
                    <p className="text-xs text-muted-foreground">What to do when this step fails</p>
                  </div>
                  <Select
                    value={editedStep.onError || 'stop'}
                    onValueChange={(value: 'stop' | 'skip' | 'retry') => updateStepField('onError', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stop">Stop</SelectItem>
                      <SelectItem value="skip">Skip</SelectItem>
                      <SelectItem value="retry">Retry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Condition (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    JavaScript expression to determine if step should run
                  </p>
                  <Textarea
                    value={editedStep.condition || ''}
                    onChange={(e) => updateStepField('condition', e.target.value)}
                    placeholder="e.g., context.userType === 'premium'"
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

// Type-specific editors
function GenerateStepEditor({
  config,
  updateConfig,
  availablePrompts,
}: {
  config: GenerateStepConfig;
  updateConfig: (updates: Partial<GenerateStepConfig>) => void;
  availablePrompts: Array<{ name: string; displayName: string }>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Prompt Template</Label>
        <Select value={config.promptId} onValueChange={(value) => updateConfig({ promptId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a prompt template" />
          </SelectTrigger>
          <SelectContent>
            {availablePrompts.map((prompt) => (
              <SelectItem key={prompt.name} value={prompt.name}>
                {prompt.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Model</Label>
        <Input
          value={config.model || 'gemini-2.0-flash-exp'}
          onChange={(e) => updateConfig({ model: e.target.value })}
          placeholder="Model name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Temperature</Label>
          <Input
            type="number"
            value={config.temperature || 0.7}
            onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
            min={0}
            max={2}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Tokens</Label>
          <Input
            type="number"
            value={config.maxTokens || 2048}
            onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
            min={1}
            max={8192}
          />
        </div>
      </div>

    </div>
  );
}

function RetrieveStepEditor({
  config,
  updateConfig,
}: {
  config: RetrieveStepConfig;
  updateConfig: (updates: Partial<RetrieveStepConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Query Template</Label>
        <Textarea
          value={config.query}
          onChange={(e) => updateConfig({ query: e.target.value })}
          placeholder="{{context.topic}}"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Retriever Name</Label>
        <Input
          value={config.retrieverName || ''}
          onChange={(e) => updateConfig({ retrieverName: e.target.value })}
          placeholder="Retriever name"
        />
      </div>

      <div className="space-y-2">
        <Label>Query Template</Label>
        <Input
          value={config.query || ''}
          onChange={(e) => updateConfig({ query: e.target.value })}
          placeholder="{{context.userQuery}}"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Top K Results</Label>
          <Input
            type="number"
            value={config.topK || 5}
            onChange={(e) => updateConfig({ topK: parseInt(e.target.value) })}
            min={1}
            max={20}
          />
        </div>

        <div className="space-y-2">
          <Label>Min Score</Label>
          <Input
            type="number"
            value={config.minScore || 0.7}
            onChange={(e) => updateConfig({ minScore: parseFloat(e.target.value) })}
            min={0}
            max={1}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}

function ToolStepEditor({
  config,
  updateConfig,
  availableTools,
}: {
  config: ToolStepConfig;
  updateConfig: (updates: Partial<ToolStepConfig>) => void;
  availableTools: Array<{ name: string; description: string }>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tool Name</Label>
        <Select value={config.toolName} onValueChange={(value) => updateConfig({ toolName: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a tool" />
          </SelectTrigger>
          <SelectContent>
            {availableTools.map((tool) => (
              <SelectItem key={tool.name} value={tool.name}>
                {tool.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tool Parameters (JSON)</Label>
        <Textarea
          value={JSON.stringify(config.parameters || {}, null, 2)}
          onChange={(e) => {
            try {
              const params = JSON.parse(e.target.value);
              updateConfig({ parameters: params });
            } catch (err) {
              // Invalid JSON
            }
          }}
          placeholder='{"param": "{{context.value}}"}'
          rows={6}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

function FormatStepEditor({
  config,
  updateConfig,
}: {
  config: FormatStepConfig;
  updateConfig: (updates: Partial<FormatStepConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select value={config.outputFormat} onValueChange={(value) => updateConfig({ outputFormat: value as any })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="text">Plain Text</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Template</Label>
        <Textarea
          value={config.template || ''}
          onChange={(e) => updateConfig({ template: e.target.value })}
          placeholder="{{context.result}}"
          rows={6}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

function ConditionStepEditor({
  config,
  updateConfig,
}: {
  config: ConditionStepConfig;
  updateConfig: (updates: Partial<ConditionStepConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Condition Expression</Label>
        <Textarea
          value={config.condition}
          onChange={(e) => updateConfig({ condition: e.target.value })}
          placeholder="context.score > 0.8"
          rows={3}
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label>True Branch Steps</Label>
        <p className="text-xs text-muted-foreground">Steps are defined inline (not by ID reference)</p>
      </div>

      <div className="space-y-2">
        <Label>False Branch Steps</Label>
        <p className="text-xs text-muted-foreground">Steps are defined inline (not by ID reference)</p>
      </div>
    </div>
  );
}

function LoopStepEditor({
  config,
  updateConfig,
}: {
  config: LoopStepConfig;
  updateConfig: (updates: Partial<LoopStepConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Items Source</Label>
        <Input
          value={config.itemsSource}
          onChange={(e) => updateConfig({ itemsSource: e.target.value })}
          placeholder="context.items"
        />
      </div>

      <div className="space-y-2">
        <Label>Item Variable Name</Label>
        <Input
          value={config.itemVariable || 'item'}
          onChange={(e) => updateConfig({ itemVariable: e.target.value })}
          placeholder="item"
        />
      </div>

      <div className="space-y-2">
        <Label>Index Variable Name</Label>
        <Input
          value={config.indexVariable || 'index'}
          onChange={(e) => updateConfig({ indexVariable: e.target.value })}
          placeholder="index"
        />
      </div>

      <div className="space-y-2">
        <Label>Loop Body Steps</Label>
        <p className="text-xs text-muted-foreground">Steps are defined inline (not by ID reference)</p>
      </div>

      <div className="space-y-2">
        <Label>Max Iterations</Label>
        <Input
          type="number"
          value={config.maxIterations || 100}
          onChange={(e) => updateConfig({ maxIterations: parseInt(e.target.value) })}
          min={1}
          max={1000}
        />
      </div>
    </div>
  );
}
