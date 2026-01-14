/**
 * Flow Builder Interface
 * Week 4 - Day 1-3: Flow Builder UI
 * 
 * Main interface for building and editing dynamic flows visually.
 */

'use client';

import { useState, useCallback } from 'react';
import { FlowCanvas } from './FlowCanvas';
import { StepLibrary } from './StepLibrary';
import { StepEditor } from './StepEditor';
import { FlowSettings } from './FlowSettings';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FlowConfiguration, FlowStep } from '@/lib/models/flow-config';
import { Save, Play, Settings, Eye, Undo2, Redo2, Keyboard, Copy, Trash2 } from 'lucide-react';
import { useUndoRedo } from '@/hooks/core/use-undo-redo';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/core/use-keyboard-shortcuts';
import { toast } from '@/hooks/util/use-toast';

interface FlowBuilderInterfaceProps {
  initialFlow?: FlowConfiguration;
  onSave?: (flow: FlowConfiguration) => void;
  onTest?: (flow: FlowConfiguration) => void;
}

export function FlowBuilderInterface({
  initialFlow,
  onSave,
  onTest,
}: FlowBuilderInterfaceProps) {
  const [flow, setFlow] = useState<FlowConfiguration>(
    initialFlow || createEmptyFlow()
  );
  const [selectedStep, setSelectedStep] = useState<FlowStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas');
  const [copiedStep, setCopiedStep] = useState<FlowStep | null>(null);

  // Undo/Redo functionality
  const {
    state: flowState,
    setState: setFlowState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<FlowConfiguration>(flow, {
    maxHistory: 50,
    onUndo: (state) => {
      setFlow(state);
      toast({ title: 'Undone', description: 'Action reverted' });
    },
    onRedo: (state) => {
      setFlow(state);
      toast({ title: 'Redone', description: 'Action restored' });
    },
  });

  // Handle adding a new step
  const handleAddStep = useCallback((stepType: string) => {
    const newStep: FlowStep = {
      id: `step-${Date.now()}`,
      name: `New ${stepType} Step`,
      type: stepType as any,
      description: '',
      config: createDefaultConfig(stepType),
    };

    const updatedFlow = {
      ...flow,
      steps: [...flow.steps, newStep],
    };

    setFlow(updatedFlow);
    setFlowState(updatedFlow);

    setSelectedStep(newStep);
    setShowStepEditor(true);
  }, [flow, setFlowState]);

  // Handle updating a step
  const handleUpdateStep = useCallback((updatedStep: FlowStep) => {
    const updatedFlow = {
      ...flow,
      steps: flow.steps.map(step =>
        step.id === updatedStep.id ? updatedStep : step
      ),
    };

    setFlow(updatedFlow);
    setFlowState(updatedFlow);

    setShowStepEditor(false);
    setSelectedStep(null);
  }, [flow, setFlowState]);

  // Handle deleting a step
  const handleDeleteStep = useCallback((stepId: string) => {
    const updatedFlow = {
      ...flow,
      steps: flow.steps.filter(step => step.id !== stepId),
    };

    setFlow(updatedFlow);
    setFlowState(updatedFlow);

    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
      setShowStepEditor(false);
    }

    toast({ title: 'Step deleted', description: 'Step removed from flow' });
  }, [flow, selectedStep, setFlowState]);

  // Handle reordering steps
  const handleReorderSteps = useCallback((newSteps: FlowStep[]) => {
    const updatedFlow = {
      ...flow,
      steps: newSteps,
    };

    setFlow(updatedFlow);
    setFlowState(updatedFlow);
  }, [flow, setFlowState]);

  // Handle copying a step
  const handleCopyStep = useCallback(() => {
    if (selectedStep) {
      setCopiedStep(selectedStep);
      toast({ title: 'Step copied', description: 'Step copied to clipboard' });
    }
  }, [selectedStep]);

  // Handle pasting a step
  const handlePasteStep = useCallback(() => {
    if (copiedStep) {
      const newStep: FlowStep = {
        ...copiedStep,
        id: `step-${Date.now()}`,
        name: `${copiedStep.name} (Copy)`,
      };

      const updatedFlow = {
        ...flow,
        steps: [...flow.steps, newStep],
      };

      setFlow(updatedFlow);
      setFlowState(updatedFlow);

      toast({ title: 'Step pasted', description: 'Step added to flow' });
    }
  }, [copiedStep, flow, setFlowState]);

  // Handle duplicating a step
  const handleDuplicateStep = useCallback(() => {
    if (selectedStep) {
      const newStep: FlowStep = {
        ...selectedStep,
        id: `step-${Date.now()}`,
        name: `${selectedStep.name} (Copy)`,
      };

      const updatedFlow = {
        ...flow,
        steps: [...flow.steps, newStep],
      };

      setFlow(updatedFlow);
      setFlowState(updatedFlow);

      toast({ title: 'Step duplicated', description: 'Step copied and added to flow' });
    }
  }, [selectedStep, flow, setFlowState]);

  // Handle selecting a step
  const handleSelectStep = useCallback((step: FlowStep) => {
    setSelectedStep(step);
    setShowStepEditor(true);
  }, []);

  // Handle saving the flow
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave?.(flow);
    } finally {
      setIsSaving(false);
    }
  }, [flow, onSave]);

  // Handle testing the flow
  const handleTest = useCallback(() => {
    onTest?.(flow);
  }, [flow, onTest]);

  // Handle flow settings update
  const handleUpdateSettings = useCallback((updates: Partial<FlowConfiguration>) => {
    setFlow(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Keyboard shortcuts (defined after all handlers)
  useKeyboardShortcuts([
    { ...COMMON_SHORTCUTS.SAVE, action: handleSave },
    { ...COMMON_SHORTCUTS.UNDO, action: undo },
    { ...COMMON_SHORTCUTS.REDO, action: redo },
    { ...COMMON_SHORTCUTS.DELETE, action: () => selectedStep && handleDeleteStep(selectedStep.id) },
    { ...COMMON_SHORTCUTS.BACKSPACE, action: () => selectedStep && handleDeleteStep(selectedStep.id) },
    { ...COMMON_SHORTCUTS.ESCAPE, action: () => { setSelectedStep(null); setShowStepEditor(false); } },
    { ...COMMON_SHORTCUTS.COPY, action: handleCopyStep },
    { ...COMMON_SHORTCUTS.PASTE, action: handlePasteStep },
    { ...COMMON_SHORTCUTS.DUPLICATE, action: handleDuplicateStep },
    { ...COMMON_SHORTCUTS.HELP, action: () => setShowShortcuts(true) },
  ]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Step Library */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Step Library</h2>
          <p className="text-sm text-gray-500">Drag steps to canvas</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <StepLibrary onAddStep={handleAddStep} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold">{flow.name || 'Untitled Flow'}</h1>
              <p className="text-sm text-gray-500">
                {flow.steps.length} steps • Version {flow.version}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 border-r pr-2 mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Step Actions (shown when step is selected) */}
            {selectedStep && (
              <div className="flex items-center gap-1 border-r pr-2 mr-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyStep}
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicateStep}
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteStep(selectedStep.id)}
                  title="Delete (Del)"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>

            {/* Main Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
            >
              <Play className="w-4 h-4 mr-2" />
              Test Flow
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Flow'}
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b border-gray-200 bg-white px-6">
              <TabsList>
                <TabsTrigger value="canvas">
                  <Eye className="w-4 h-4 mr-2" />
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="canvas" className="h-full mt-0">
              <FlowCanvas
                steps={flow.steps}
                selectedStep={selectedStep}
                onSelectStep={handleSelectStep}
                onReorderSteps={handleReorderSteps}
                onDeleteStep={handleDeleteStep}
              />
            </TabsContent>

            <TabsContent value="json" className="h-full mt-0 p-6">
              <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-auto h-full">
                {JSON.stringify(flow, null, 2)}
              </pre>
            </TabsContent>

            <TabsContent value="preview" className="h-full mt-0 p-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Flow Preview</h3>
                <div className="space-y-4">
                  {flow.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500">
                            Step {index + 1}
                          </span>
                          <h4 className="font-medium">{step.name}</h4>
                          <p className="text-sm text-gray-500">{step.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Step Editor Modal */}
      {showStepEditor && selectedStep && (
        <StepEditor
          step={selectedStep}
          onSave={handleUpdateStep}
          onClose={() => {
            setShowStepEditor(false);
            setSelectedStep(null);
          }}
        />
      )}

      {/* Flow Settings Modal */}
      {showSettings && (
        <FlowSettings
          flow={flow}
          onSave={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
    </div>
  );
}

// Helper functions
function createEmptyFlow(): FlowConfiguration {
  return {
    id: '',
    name: 'New Flow',
    description: '',
    version: '1.0.0',
    tags: [],
    status: 'draft',
    inputSchema: {
      type: 'zod',
      fields: [],
      required: true,
    },
    outputSchema: {
      type: 'zod',
      fields: [],
      required: true,
    },
    steps: [],
    config: {},
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      updatedBy: 'user',
    },
  };
}

function createDefaultConfig(stepType: string): any {
  const configs: Record<string, any> = {
    retrieve: {
      type: 'retrieve',
      query: '',
      limit: 10,
      outputVariable: 'documents',
    },
    generate: {
      type: 'generate',
      prompt: '',
      outputVariable: 'output',
    },
    tool: {
      type: 'tool',
      toolName: '',
      parameters: {},
      outputVariable: 'result',
    },
    format: {
      type: 'format',
      template: '',
      format: 'text',
      outputVariable: 'formatted',
    },
    transform: {
      type: 'transform',
      input: '',
      transformer: '',
      outputVariable: 'transformed',
    },
  };

  return configs[stepType] || {};
}
