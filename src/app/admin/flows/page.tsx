/**
 * Admin Flows Management Page
 * 
 * Page for managing dynamic flows with create, edit, delete operations.
 */

'use client';

import React, { useState } from 'react';
import { FlowConfiguration } from '@/lib/models/flow-config';
import { FlowList } from '@/components/admin/flow-builder/FlowList';
import { FlowBuilderInterface } from '@/components/admin/flow-builder/FlowBuilderInterface';
import { FlowTester } from '@/components/admin/flow-builder/FlowTester';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToast } from '@/hooks/util/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function AdminFlowsPage() {
  const [flows, setFlows] = useState<FlowConfiguration[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowConfiguration | null>(null);
  const [mode, setMode] = useState<'list' | 'edit' | 'test'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch flows on mount
  React.useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/flows');
      if (!response.ok) throw new Error('Failed to fetch flows');
      const data = await response.json();
      setFlows(data.flows || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load flows',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlow = () => {
    setSelectedFlow(null);
    setMode('edit');
  };

  const handleEditFlow = (flow: FlowConfiguration) => {
    setSelectedFlow(flow);
    setMode('edit');
  };

  const handleTestFlow = (flow: FlowConfiguration) => {
    setSelectedFlow(flow);
    setMode('test');
  };

  const handleSaveFlow = async (flowData: Partial<FlowConfiguration>) => {
    try {
      const url = selectedFlow?.id
        ? `/api/admin/flows/${selectedFlow.id}`
        : '/api/admin/flows';
      
      const method = selectedFlow?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) throw new Error('Failed to save flow');

      toast({
        title: 'Success',
        description: `Flow ${selectedFlow?.id ? 'updated' : 'created'} successfully`,
      });

      await fetchFlows();
      setMode('list');
      setSelectedFlow(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save flow',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm('Are you sure you want to delete this flow?')) return;

    try {
      const response = await fetch(`/api/admin/flows/${flowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete flow');

      toast({
        title: 'Success',
        description: 'Flow deleted successfully',
      });

      await fetchFlows();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flow',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateFlow = async (flow: FlowConfiguration) => {
    const { id, ...flowData } = flow;
    const duplicate = {
      ...flowData,
      name: `${flow.name}-copy`,
      displayName: `${flow.displayName} (Copy)`,
      status: 'draft' as const,
    };
    
    try {
      const response = await fetch('/api/admin/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicate),
      });

      if (!response.ok) throw new Error('Failed to duplicate flow');

      toast({
        title: 'Success',
        description: 'Flow duplicated successfully',
      });

      await fetchFlows();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate flow',
        variant: 'destructive',
      });
    }
  };

  const handleRunTest = async (flowId: string, input: Record<string, any>) => {
    const response = await fetch('/api/flows/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, input }),
    });

    if (!response.ok) throw new Error('Test execution failed');

    return await response.json();
  };

  if (mode === 'edit') {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b p-4">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Flows
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <FlowBuilderInterface
            initialFlow={selectedFlow || undefined}
            onSave={handleSaveFlow}
            onTest={(flow) => {
              setSelectedFlow(flow as FlowConfiguration);
              setMode('test');
            }}
          />
        </div>
      </div>
    );
  }

  if (mode === 'test' && selectedFlow) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b p-4">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Flows
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <FlowTester flow={selectedFlow} onTest={handleRunTest} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <FlowList
        flows={flows}
        onFlowCreate={handleCreateFlow}
        onFlowEdit={handleEditFlow}
        onFlowDelete={handleDeleteFlow}
        onFlowDuplicate={handleDuplicateFlow}
        onFlowTest={handleTestFlow}
      />
    </div>
  );
}
