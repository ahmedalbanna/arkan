/**
 * Admin Prompts Management Page
 * 
 * Page for managing prompt templates with create, edit, delete operations.
 */

'use client';

import React, { useState } from 'react';
import { PromptConfiguration } from '@/lib/models/prompt-config';
import { PromptList } from '@/components/admin/prompts/PromptList';
import { PromptEditor } from '@/components/admin/prompts/PromptEditor';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToast } from '@/hooks/util/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<PromptConfiguration[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptConfiguration | null>(null);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch prompts on mount
  React.useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load prompts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    setSelectedPrompt(null);
    setMode('edit');
  };

  const handleEditPrompt = (prompt: PromptConfiguration) => {
    setSelectedPrompt(prompt);
    setMode('edit');
  };

  const handleSavePrompt = async (promptData: Partial<PromptConfiguration>) => {
    try {
      const url = selectedPrompt?.id
        ? `/api/admin/prompts/${selectedPrompt.id}`
        : '/api/admin/prompts';
      
      const method = selectedPrompt?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData),
      });

      if (!response.ok) throw new Error('Failed to save prompt');

      toast({
        title: 'Success',
        description: `Prompt ${selectedPrompt?.id ? 'updated' : 'created'} successfully`,
      });

      await fetchPrompts();
      setMode('list');
      setSelectedPrompt(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save prompt',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prompt');

      toast({
        title: 'Success',
        description: 'Prompt deleted successfully',
      });

      await fetchPrompts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete prompt',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicatePrompt = async (prompt: PromptConfiguration) => {
    const { id, ...promptData } = prompt;
    const duplicate = {
      ...promptData,
      name: `${prompt.name}-copy`,
      displayName: `${prompt.displayName} (Copy)`,
      status: 'draft' as const,
    };
    
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicate),
      });

      if (!response.ok) throw new Error('Failed to duplicate prompt');

      toast({
        title: 'Success',
        description: 'Prompt duplicated successfully',
      });

      await fetchPrompts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate prompt',
        variant: 'destructive',
      });
    }
  };

  const handleTestPrompt = (prompt: Partial<PromptConfiguration>) => {
    toast({
      title: 'Test Prompt',
      description: 'Prompt testing feature coming soon',
    });
  };

  if (mode === 'edit') {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b p-4">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Prompts
          </Button>
        </div>
        <div className="flex-1 overflow-hidden p-6">
          <div className="max-w-5xl mx-auto">
            <PromptEditor
              initialPrompt={selectedPrompt || undefined}
              onSave={handleSavePrompt}
              onTest={handleTestPrompt}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <PromptList
        prompts={prompts}
        onPromptCreate={handleCreatePrompt}
        onPromptEdit={handleEditPrompt}
        onPromptDelete={handleDeletePrompt}
        onPromptDuplicate={handleDuplicatePrompt}
        onPromptTest={handleTestPrompt}
      />
    </div>
  );
}
