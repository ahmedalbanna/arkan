/**
 * Flow Builder Canvas
 * Week 3 - Day 1: Visual Flow Builder
 * 
 * Drag-and-drop flow builder using React Flow
 */

'use client';

import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Save, Play, FileJson } from 'lucide-react';
import { StepNode } from './StepNode';
import { StepConfigPanel } from './StepConfigPanel';
import type { FlowConfiguration, FlowStep } from '@/lib/models/flow-config';

// ============================================================================
// Flow Builder Canvas Component
// ============================================================================

interface FlowBuilderCanvasProps {
  flowConfig?: FlowConfiguration;
  onSave?: (config: FlowConfiguration) => void;
  onExecute?: (config: FlowConfiguration) => void;
  readOnly?: boolean;
}

export function FlowBuilderCanvas({
  flowConfig,
  onSave,
  onExecute,
  readOnly = false
}: FlowBuilderCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      stepNode: StepNode,
    }),
    []
  );

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, readOnly]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setShowConfigPanel(true);
    },
    []
  );

  // Add new step
  const addStep = useCallback(
    (type: FlowStep['type']) => {
      if (readOnly) return;

      const newNode: Node = {
        id: `step_${Date.now()}`,
        type: 'stepNode',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          step: {
            id: `step_${Date.now()}`,
            name: `New ${type} Step`,
            type,
            config: {},
          },
          onEdit: () => {
            setSelectedNode(newNode);
            setShowConfigPanel(true);
          },
          onDelete: () => {
            setNodes((nds) => nds.filter((n) => n.id !== newNode.id));
            setEdges((eds) => eds.filter((e) => e.source !== newNode.id && e.target !== newNode.id));
          },
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, setEdges, readOnly]
  );

  // Save flow
  const handleSave = useCallback(() => {
    if (!onSave) return;

    // Convert nodes and edges to flow config
    const steps: FlowStep[] = nodes.map((node) => node.data.step);
    
    const config: FlowConfiguration = {
      id: flowConfig?.id || `flow_${Date.now()}`,
      name: flowConfig?.name || 'New Flow',
      description: flowConfig?.description || '',
      version: flowConfig?.version || '1.0.0',
      tags: flowConfig?.tags || [],
      status: flowConfig?.status || 'draft',
      inputSchema: flowConfig?.inputSchema || {},
      outputSchema: flowConfig?.outputSchema || {},
      steps,
      config: flowConfig?.config || {},
      createdAt: flowConfig?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(config);
  }, [nodes, edges, flowConfig, onSave]);

  // Execute flow
  const handleExecute = useCallback(() => {
    if (!onExecute) return;

    const steps: FlowStep[] = nodes.map((node) => node.data.step);
    const config: FlowConfiguration = {
      ...flowConfig!,
      steps,
      updatedAt: new Date(),
    };

    onExecute(config);
  }, [nodes, flowConfig, onExecute]);

  // Export as JSON
  const handleExport = useCallback(() => {
    const steps: FlowStep[] = nodes.map((node) => node.data.step);
    const config = {
      ...flowConfig,
      steps,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowConfig?.name || 'flow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, flowConfig]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <Card className="p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {flowConfig?.name || 'Flow Builder'}
          </h2>
          <span className="text-sm text-muted-foreground">
            v{flowConfig?.version || '1.0.0'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              {/* Add Step Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('prompt')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Prompt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('tool')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tool
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('condition')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Condition
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('loop')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Loop
              </Button>

              <div className="h-6 w-px bg-border mx-2" />

              {/* Action Buttons */}
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExecute}
            disabled={!flowConfig || nodes.length === 0}
          >
            <Play className="w-4 h-4 mr-1" />
            Execute
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
          >
            <FileJson className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </Card>

      {/* Canvas */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.data.step?.type) {
                case 'prompt':
                  return '#3b82f6';
                case 'tool':
                  return '#10b981';
                case 'condition':
                  return '#f59e0b';
                case 'loop':
                  return '#8b5cf6';
                case 'parallel':
                  return '#ec4899';
                default:
                  return '#6b7280';
              }
            }}
          />
        </ReactFlow>
      </div>

      {/* Configuration Panel */}
      {showConfigPanel && selectedNode && (
        <StepConfigPanel
          step={selectedNode.data.step}
          onUpdate={(updatedStep) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === selectedNode.id
                  ? { ...n, data: { ...n.data, step: updatedStep } }
                  : n
              )
            );
          }}
          onClose={() => {
            setShowConfigPanel(false);
            setSelectedNode(null);
          }}
          allSteps={nodes.map((node) => node.data.step)}
          flowConfig={flowConfig}
        />
      )}

      {/* Empty State */}
      {nodes.length === 0 && !readOnly && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Start building your flow by adding steps
            </p>
            <div className="flex gap-2 pointer-events-auto justify-center">
              <Button
                variant="outline"
                onClick={() => addStep('prompt')}
              >
                Add Prompt Step
              </Button>
              <Button
                variant="outline"
                onClick={() => addStep('tool')}
              >
                Add Tool Step
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
