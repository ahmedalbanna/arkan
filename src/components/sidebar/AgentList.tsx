'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentStore } from '@/hooks/use-agent-store';
import type { Agent } from '@/types/agent';
import { cn } from '@/lib/utils/cn';
import { Edit, MoreVertical, PlusCircle, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AgentDialog } from './AgentDialog';
import { Input } from '../ui/input';

interface AgentListProps {
  agents: Agent[];
}

export const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  const { selectedAgent, selectAgent, deleteAgent } = useAgentStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEditClick = (agent: Agent) => {
    setAgentToEdit(agent);
    setIsEditOpen(true);
  };
  
  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setIsDeleteOpen(true);
  }

  const confirmDelete = () => {
    if (agentToDelete) {
        deleteAgent(agentToDelete.id);
    }
    setIsDeleteOpen(false);
    setAgentToDelete(null);
  }

  const filteredAgents = useMemo(() => {
    if (!searchQuery) {
        return agents;
    }
    return agents.filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agents, searchQuery]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold">Agents</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="h-5 w-5" />
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
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {agent.data.avatar?.data.value || agent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">{agent.name}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditClick(agent)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeleteClick(agent)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Create Dialog */}
      <AgentDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* Edit Dialog */}
      <AgentDialog agent={agentToEdit} isOpen={isEditOpen} onOpenChange={setIsEditOpen} />

      {/* Delete Confirmation Dialog */}
       <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the agent "{agentToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
