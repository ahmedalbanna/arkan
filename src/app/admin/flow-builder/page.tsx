/**
 * Flow Builder Admin Page
 * Week 3 - Day 3: Main Admin Page
 */

'use client';

import React, { useState } from 'react';
import { FlowBuilderCanvas } from '@/components/admin/flow-builder/FlowBuilderCanvas';
import { FlowListPage } from '@/components/admin/flow-builder/FlowListPage';
import { ExecutionTraceViewer } from '@/components/admin/flow-builder/ExecutionTraceViewer';
import { FlowStatsDashboard } from '@/components/admin/flow-builder/FlowStatsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import type { FlowConfiguration } from '@/lib/models/flow-config';
import type { ExecutionTrace } from '@/services/execution-trace-service';

export default function FlowBuilderPage() {
  const [selectedFlow, setSelectedFlow] = useState<FlowConfiguration | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<ExecutionTrace | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Fetch analytics for selected flow
  const { data: analytics } = useQuery({
    queryKey: ['flow-analytics', selectedFlow?.id],
    queryFn: async () => {
      if (!selectedFlow) return null;
      const response = await fetch(`/api/admin/flows/${selectedFlow.id}/analytics`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!selectedFlow && activeTab === 'stats',
  });

  const handleCreateNew = () => {
    setSelectedFlow({
      id: `flow_${Date.now()}`,
      name: 'New Flow',
      description: '',
      version: '1.0.0',
      tags: [],
      status: 'draft',
      inputSchema: {},
      outputSchema: {},
      steps: [],
      config: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setActiveTab('builder');
  };

  const handleEdit = (flow: FlowConfiguration) => {
    setSelectedFlow(flow);
    setActiveTab('builder');
  };

  const handleExecute = async (flow: FlowConfiguration) => {
    try {
      // TODO: Show input dialog
      const input = { test: 'input' };

      const response = await fetch('/api/admin/flows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: flow.id,
          flowVersion: flow.version,
          input,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.traceId) {
        // Fetch the trace
        const traceResponse = await fetch(`/api/admin/traces/${result.traceId}`);
        const traceData = await traceResponse.json();
        setSelectedTrace(traceData.trace);
        setActiveTab('traces');
      }
    } catch (error) {
      console.error('Failed to execute flow:', error);
    }
  };

  const handleViewStats = (flow: FlowConfiguration) => {
    setSelectedFlow(flow);
    setActiveTab('stats');
  };

  const handleSave = async (config: FlowConfiguration) => {
    try {
      const response = await fetch(`/api/admin/flows/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Flow saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
      alert('Failed to save flow');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Flows</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="traces">Traces</TabsTrigger>
          <TabsTrigger value="stats">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <FlowListPage
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onExecute={handleExecute}
            onViewStats={handleViewStats}
          />
        </TabsContent>

        <TabsContent value="builder" className="mt-6 h-[800px]">
          {selectedFlow ? (
            <FlowBuilderCanvas
              flowConfig={selectedFlow}
              onSave={handleSave}
              onExecute={handleExecute}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Select a flow to edit or create a new one
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="traces" className="mt-6">
          {selectedTrace ? (
            <ExecutionTraceViewer trace={selectedTrace} />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Execute a flow to view its trace
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          {selectedFlow && analytics ? (
            <FlowStatsDashboard analytics={analytics} />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                Select a flow to view its analytics
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
