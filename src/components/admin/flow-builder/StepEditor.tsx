/**
 * Step Editor Component
 * Week 4 - Day 1-3: Step Configuration Editor
 * 
 * Modal for editing step configurations.
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FlowStep } from '@/lib/models/flow-config';
import { X } from 'lucide-react';

interface StepEditorProps {
  step: FlowStep;
  onSave: (step: FlowStep) => void;
  onClose: () => void;
}

export function StepEditor({ step, onSave, onClose }: StepEditorProps) {
  const [editedStep, setEditedStep] = useState<FlowStep>(step);

  const handleSave = () => {
    onSave(editedStep);
  };

  const updateField = (field: string, value: any) => {
    setEditedStep(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateConfig = (field: string, value: any) => {
    setEditedStep(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Step: {step.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="error">Error Handling</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label>Step Name</Label>
              <Input
                value={editedStep.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter step name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={editedStep.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what this step does"
                rows={3}
              />
            </div>

            <div>
              <Label>Step Type</Label>
              <Input value={editedStep.type} disabled className="bg-gray-100" />
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            {editedStep.type === 'retrieve' && (
              <RetrieveConfig config={editedStep.config} onChange={updateConfig} />
            )}
            {editedStep.type === 'generate' && (
              <GenerateConfig config={editedStep.config} onChange={updateConfig} />
            )}
            {editedStep.type === 'tool' && (
              <ToolConfig config={editedStep.config} onChange={updateConfig} />
            )}
            {editedStep.type === 'format' && (
              <FormatConfig config={editedStep.config} onChange={updateConfig} />
            )}
            {editedStep.type === 'transform' && (
              <TransformConfig config={editedStep.config} onChange={updateConfig} />
            )}
          </TabsContent>

          {/* Error Handling Tab */}
          <TabsContent value="error" className="space-y-4">
            <div>
              <Label>On Error</Label>
              <Select
                value={editedStep.errorHandling?.onError || 'fail'}
                onValueChange={(value) => updateField('errorHandling', {
                  ...editedStep.errorHandling,
                  onError: value,
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fail">Fail Execution</SelectItem>
                  <SelectItem value="continue">Continue</SelectItem>
                  <SelectItem value="retry">Retry</SelectItem>
                  <SelectItem value="fallback">Use Fallback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editedStep.errorHandling?.onError === 'retry' && (
              <>
                <div>
                  <Label>Max Retry Attempts</Label>
                  <Input
                    type="number"
                    value={editedStep.retry?.maxAttempts || 3}
                    onChange={(e) => updateField('retry', {
                      ...editedStep.retry,
                      maxAttempts: parseInt(e.target.value),
                    })}
                  />
                </div>

                <div>
                  <Label>Backoff Strategy</Label>
                  <Select
                    value={editedStep.retry?.backoff || 'exponential'}
                    onValueChange={(value) => updateField('retry', {
                      ...editedStep.retry,
                      backoff: value,
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Step-specific configuration components
function RetrieveConfig({ config, onChange }: any) {
  return (
    <>
      <div>
        <Label>Query Template</Label>
        <Textarea
          value={config.query || ''}
          onChange={(e) => onChange('query', e.target.value)}
          placeholder="Enter search query (use {{variables}})"
          rows={3}
        />
      </div>
      <div>
        <Label>Limit</Label>
        <Input
          type="number"
          value={config.limit || 10}
          onChange={(e) => onChange('limit', parseInt(e.target.value))}
        />
      </div>
      <div>
        <Label>Output Variable</Label>
        <Input
          value={config.outputVariable || ''}
          onChange={(e) => onChange('outputVariable', e.target.value)}
          placeholder="documents"
        />
      </div>
    </>
  );
}

function GenerateConfig({ config, onChange }: any) {
  return (
    <>
      <div>
        <Label>Prompt</Label>
        <Textarea
          value={config.prompt || ''}
          onChange={(e) => onChange('prompt', e.target.value)}
          placeholder="Enter prompt (use {{variables}})"
          rows={5}
        />
      </div>
      <div>
        <Label>Output Variable</Label>
        <Input
          value={config.outputVariable || ''}
          onChange={(e) => onChange('outputVariable', e.target.value)}
          placeholder="output"
        />
      </div>
      <div>
        <Label>Output Format</Label>
        <Select
          value={config.outputFormat || 'text'}
          onValueChange={(value) => onChange('outputFormat', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function ToolConfig({ config, onChange }: any) {
  return (
    <>
      <div>
        <Label>Tool Name</Label>
        <Input
          value={config.toolName || ''}
          onChange={(e) => onChange('toolName', e.target.value)}
          placeholder="google-search"
        />
      </div>
      <div>
        <Label>Parameters (JSON)</Label>
        <Textarea
          value={JSON.stringify(config.parameters || {}, null, 2)}
          onChange={(e) => {
            try {
              onChange('parameters', JSON.parse(e.target.value));
            } catch {}
          }}
          placeholder='{"param": "value"}'
          rows={5}
        />
      </div>
      <div>
        <Label>Output Variable</Label>
        <Input
          value={config.outputVariable || ''}
          onChange={(e) => onChange('outputVariable', e.target.value)}
          placeholder="result"
        />
      </div>
    </>
  );
}

function FormatConfig({ config, onChange }: any) {
  return (
    <>
      <div>
        <Label>Template</Label>
        <Textarea
          value={config.template || ''}
          onChange={(e) => onChange('template', e.target.value)}
          placeholder="Output: {{variable}}"
          rows={5}
        />
      </div>
      <div>
        <Label>Format</Label>
        <Select
          value={config.format || 'text'}
          onValueChange={(value) => onChange('format', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Output Variable</Label>
        <Input
          value={config.outputVariable || ''}
          onChange={(e) => onChange('outputVariable', e.target.value)}
          placeholder="formatted"
        />
      </div>
    </>
  );
}

function TransformConfig({ config, onChange }: any) {
  return (
    <>
      <div>
        <Label>Input Variable</Label>
        <Input
          value={config.input || ''}
          onChange={(e) => onChange('input', e.target.value)}
          placeholder="inputVariable"
        />
      </div>
      <div>
        <Label>Transformer</Label>
        <Input
          value={config.transformer || ''}
          onChange={(e) => onChange('transformer', e.target.value)}
          placeholder="uppercase"
        />
      </div>
      <div>
        <Label>Output Variable</Label>
        <Input
          value={config.outputVariable || ''}
          onChange={(e) => onChange('outputVariable', e.target.value)}
          placeholder="transformed"
        />
      </div>
    </>
  );
}
