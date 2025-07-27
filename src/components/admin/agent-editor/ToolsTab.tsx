
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Coffee, Briefcase, Bot, Pencil, Link as LinkIcon, AlertCircle } from 'lucide-react';

const mockTools = [
  {
    icon: Coffee,
    name: 'Proposal Automation',
    description: 'Runs Run Agent Command, Run Agent Command',
    isActive: true,
  },
  {
    icon: Briefcase,
    name: 'Taskade Actions',
    description: 'Use your agent to manage tasks in your projects, update due dates, assignments, and more.',
    isActive: true,
  },
  {
    icon: Bot,
    name: 'Taskade AI',
    description: '4 actions',
    isActive: false,
  },
];

export default function ToolsTab() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Active', 'Taskade', 'Apps', 'Custom'];
  
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
            {filter === 'All' && <Badge className="ml-2 bg-background text-foreground">19</Badge>}
            {filter === 'Active' && <Badge className="ml-2 bg-background text-foreground">2</Badge>}
            {filter === 'Taskade' && <Badge className="ml-2 bg-background text-foreground">3</Badge>}
            {filter === 'Apps' && <Badge className="ml-2 bg-background text-foreground">15</Badge>}
            {filter === 'Custom' && <Badge className="ml-2 bg-background text-foreground">1</Badge>}
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
        <h3 className="text-lg font-semibold">All</h3>
        {mockTools.map((tool, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg border p-4">
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
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
              <Switch checked={tool.isActive} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
