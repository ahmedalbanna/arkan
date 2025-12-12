
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentManager } from '@/hooks/use-agent-store';
import type { AgentProperties } from '@/lib/models';
import { cn } from '@/lib/utils/cn';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Input } from '../ui/input';
import { AgentDialog } from './AgentDialog';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from '../ui/use-toast';

interface AgentListProps {
  agents: AgentProperties[];
}

export const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  const { selectedAgent, selectAgent, deleteAgent } = useAgentManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentProperties | null>(null);

  const handleDelete = (agentId: string) => {
    deleteAgent(agentId).catch((error) => {
      toast({
        title: 'Error Deleting Agent',
        description: error.message,
        variant: 'destructive',
      });
    });
  };

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
        return agents;
    }
    
    const lowercasedQuery = searchQuery.toLowerCase();

    return agents.filter(agent => {
      const name = (agent.name || '').toLowerCase();
      const description = (agent.description || '').toLowerCase();
      const category = (agent.category || '').toLowerCase();
      const guidelines = (agent.guidelines || []).join(' ').toLowerCase();
      
      const searchText = `${name} ${description} ${category} ${guidelines}`;
      return searchText.includes(lowercasedQuery);
    });
  }, [agents, searchQuery]);

  return (
    <>
      <AgentDialog
        agent={editingAgent}
        isOpen={isCreateOpen || !!editingAgent}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingAgent(null);
          }
        }}
      />
      <div className="flex h-full flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">Agents</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New
          </Button>
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
                      {agent.name?.charAt(0) || '?'}
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingAgent(agent)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the agent "{agent.name}". This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(agent.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {filteredAgents.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No agents found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
          </div>
        )}
      </div>
    </>
  );
};
