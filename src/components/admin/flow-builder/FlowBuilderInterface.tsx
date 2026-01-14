/**
 * Flow Builder Interface
 * 
 * Enhanced visual interface for creating and editing flows with drag-and-drop functionality.
 */

'use client';

import React, { useState } from 'react';
import { FlowConfiguration, FlowStep, StepType } from '@/lib/models/flow-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Play, Settings, Trash2, ArrowLeft, Info } from 'lucide-react';
import { FlowCanvas } from './FlowCanvas';
import { StepEditor } from './StepEditor';
import { StepLibrary } from './StepLibrary';

interface FlowBuilderInterfaceProps {
  initialFlow?: FlowConfiguration;
  onSave?: (flow: Partial<FlowConfiguration>) => void;
  onTest?: (flow: Partial<FlowConfiguration>) => void;
  availablePrompts?: Array<{ name: string; displayName: string }>;
  availableTools?: Array<{ name: string; description: string }>;
}

export function FlowBuilderInterface({
  initialFlow,
  onSave,
  onTest,
  availablePrompts = [],
  availableTools = [],
}: FlowBuilderInterfaceProps) {
  const [flow, setFlow] = useState<Partial<FlowConfiguration>>(
    initialFlow || {
      name: '',
      displayName: '',
      description: '',
      category: 'general',
      tags: [],
      steps: [],
      status: 'draft',
    }
  );

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [view, setView] = useState<'builder' | 'settings'>('builder');

  // Get selected step
  const selectedStep = selectedStepId
    ? flow.steps?.find((s) => s.id === selectedStepId)
    : null;

  // Add new step
  const handleAddStep = (type: StepType, afterStepId?: string) => {
    const newStep: FlowStep = {
      id: `step-${Date.now()}`,
      type,
      name: `${type} Step`,
      description: '',
      config: { type } as any,
      inputSchema: {},
      outputSchema: {},
    };

    let updatedSteps = [...(flow.steps || [])];

    if (afterStepId) {
      const index = updatedSteps.findIndex((s) => s.id === afterStepId);
      updatedSteps.splice(index + 1, 0, newStep);
    } else {
      updatedSteps.push(newStep);
    }

    setFlow({ ...flow, steps: updatedSteps });
    setSelectedStepId(newStep.id);
    setShowStepEditor(true);
  };

  // Update step
  const handleUpdateStep = (step: FlowStep) => {
    const updatedSteps = (flow.steps || []).map((s) =>
      s.id === step.id ? step : s
    );
    setFlow({ ...flow, steps: updatedSteps });
    setShowStepEditor(false);
    setSelectedStepId(null);
  };

  // Delete step
  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = (flow.steps || []).filter((s) => s.id !== stepId);
    setFlow({ ...flow, steps: updatedSteps });
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
      setShowStepEditor(false);
    }
  };

  // Reorder step
  const handleReorderStep = (stepId: string, newIndex: number) => {
    const updatedSteps = [...(flow.steps || [])];
    const oldIndex = updatedSteps.findIndex((s) => s.id === stepId);
    
    if (oldIndex === -1 || newIndex < 0 || newIndex >= updatedSteps.length) return;

    const [movedStep] = updatedSteps.splice(oldIndex, 1);
    updatedSteps.splice(newIndex, 0, movedStep);

    setFlow({ ...flow, steps: updatedSteps });
  };

  // Handle step select
  const handleStepSelect = (stepId: string) => {
    setSelectedStepId(stepId);
    setShowStepEditor(true);
  };

  // Save flow
  const handleSave = () => {
    if (onSave) {
      onSave(flow);
    }
  };

  // Test flow
  const handleTest = () => {
    if (onTest) {
      onTest(flow);
    }
  };

  return (
    <div className="flex h-screen bg-muted/10">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold">{flow.displayName || 'New Flow'}</h1>
              <p className="text-xs text-muted-foreground">
                {flow.steps?.length || 0} steps • {flow.status || 'draft'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTest} disabled={!flow.steps?.length}>
              <Play className="w-4 h-4 mr-2" />
              Test Flow
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex pt-16 overflow-hidden">
        {/* Left Sidebar - Step Library */}
        <div className="w-80 border-r bg-background">
          <Card className="h-full rounded-none border-0">
            <StepLibrary onStepSelect={handleAddStep} />
          </Card>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 overflow-hidden">
          {view === 'builder' ? (
            <FlowCanvas
              steps={flow.steps || []}
              selectedStepId={selectedStepId ?? undefined}
              onStepSelect={handleStepSelect}
              onStepAdd={(afterStepId) => handleAddStep('GENERATE', afterStepId)}
              onStepDelete={handleDeleteStep}
              onStepReorder={handleReorderStep}
            />
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Flow Settings</CardTitle>
                    <CardDescription>Configure basic flow properties</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="flow-name">Internal Name</Label>
                      <Input
                        id="flow-name"
                        placeholder="flow-name"
                        value={flow.name || ''}
                        onChange={(e) => setFlow({ ...flow, name: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for API calls and internal references
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        placeholder="My Awesome Flow"
                        value={flow.displayName || ''}
                        onChange={(e) => setFlow({ ...flow, displayName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this flow does..."
                        value={flow.description || ''}
                        onChange={(e) => setFlow({ ...flow, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="general"
                          value={flow.category || ''}
                          onChange={(e) => setFlow({ ...flow, category: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={flow.status}
                          onValueChange={(value: any) => setFlow({ ...flow, status: value })}
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="tag1, tag2, tag3"
                        value={flow.tags?.join(', ') || ''}
                        onChange={(e) =>
                          setFlow({
                            ...flow,
                            tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Step Editor Sheet */}
      <Sheet open={showStepEditor} onOpenChange={setShowStepEditor}>
        <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[600px] p-0">
          {selectedStep && (
            <StepEditor
              step={selectedStep}
              onSave={handleUpdateStep}
              onCancel={() => {
                setShowStepEditor(false);
                setSelectedStepId(null);
              }}
              availablePrompts={availablePrompts}
              availableTools={availableTools}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
