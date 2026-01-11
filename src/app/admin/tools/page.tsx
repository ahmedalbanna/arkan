/**
 * Admin Tools Registry Page
 * 
 * Page for viewing and managing registered tools.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ToolConfiguration } from '@/lib/models/tool-config';
import { ToolRegistry } from '@/components/admin/tools/ToolRegistry';
import { useToast } from '@/hooks/util/use-toast';

export default function AdminToolsPage() {
  const [tools, setTools] = useState<ToolConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/tools');
      if (!response.ok) throw new Error('Failed to fetch tools');
      const data = await response.json();
      setTools(data.tools || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tools',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolSelect = (tool: ToolConfiguration) => {
    // Tool selected - details shown in ToolRegistry component
  };

  const handleToolAdd = () => {
    toast({
      title: 'Add Tool',
      description: 'Tool registration feature coming soon',
    });
  };

  return (
    <div className="h-screen">
      <ToolRegistry
        tools={tools}
        onToolSelect={handleToolSelect}
        onToolAdd={handleToolAdd}
      />
    </div>
  );
}
