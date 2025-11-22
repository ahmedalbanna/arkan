'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentStore } from '@/hooks/use-agent-store';
import type { Agent } from '@/types/agent';
import { cn } from '@/lib/utils/cn';
import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Input } from '../ui/input';

interface AgentListProps {
  agents: Agent[];
}

export const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  const { selectedAgent, selectAgent } = useAgentStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Use local filtering to avoid setState during render
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
        return agents;
    }
    
    // Perform local search without updating store state
    return agents.filter(agent => {
      const name = agent.name.toLowerCase();
      const description = (agent.description || agent.data?.description || '').toLowerCase();
      const category = (agent.category || '').toLowerCase();
      const tags = (agent.tags || []).join(' ').toLowerCase();
      const commands = (agent.commands || agent.data?.commands || [])
        .map(cmd => (cmd.name + ' ' + cmd.description).toLowerCase())
        .join(' ');
      
      const searchText = `${name} ${description} ${category} ${tags} ${commands}`;
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [agents, searchQuery]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold">Agents</h2>
        <div className="text-sm text-muted-foreground">
          {filteredAgents.length} agents
        </div>
      </header>
       <div className="relative border-b p-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                'group flex cursor-pointer items-center justify-between rounded-md p-2 text-sm hover:bg-muted',
                selectedAgent?.id === agent.id && 'bg-secondary'
              )}
              onClick={() => selectAgent(agent.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>
                    {agent.icon || agent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{agent.name}</div>
                  {agent.category && (
                    <div className="text-xs text-muted-foreground truncate">
                      {agent.category}
                    </div>
                  )}
                </div>
              </div>
              {(agent.commands?.length || agent.data?.commands?.length) && (
                <div className="text-xs text-muted-foreground shrink-0">
                  {(agent.commands || agent.data?.commands || []).length} commands
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {filteredAgents.length === 0 && searchQuery && (
        <div className="p-4 text-center text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No agents found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};
