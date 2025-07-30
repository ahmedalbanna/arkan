
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { AVAILABLE_TOOLS, type AgentTool } from '@/lib/tools';

export default function ToolsTab() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tools, setTools] = useState<AgentTool[]>(AVAILABLE_TOOLS);

  const filters = ['All', 'Active', 'Taskade', 'Apps', 'Custom'];

  const handleToggle = (toolId: string) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId ? { ...tool, isActive: !tool.isActive } : tool
      )
    );
  };
  
  const activeCount = tools.filter(t => t.isActive).length;

  return (
    <div className="space-y-6">
      <CardTitle>Tools</CardTitle>
      <p className="text-sm text-muted-foreground">
        Equip your AI Agents with tools to gather data, complete tasks, and automate actions, or build custom tools for autonomous workflows. <a href="#" className="text-primary underline">Learn more.</a>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter)}
            className="rounded-full"
          >
            {filter}
            {filter === 'All' && <Badge className="ml-2 bg-background text-foreground">{tools.length}</Badge>}
            {filter === 'Active' && <Badge className="ml-2 bg-background text-foreground">{activeCount}</Badge>}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter tools..." className="pl-10" />
        </div>
        <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> New tool</Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Tools</h3>
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <tool.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">{tool.name}</p>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Switch checked={tool.isActive} onCheckedChange={() => handleToggle(tool.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
