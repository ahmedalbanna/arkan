'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentManager } from '@/hooks/use-agent-store';
import { type AgentProperties } from '@/modules/ai/domain/entities/Agent';
import { cn } from '@/infrastructure/utils/cn';
import { Edit3, MoreHorizontal, PlusCircle, Search, Sparkles, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { AgentDialog } from './AgentDialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { AgentGeneratorDialog } from './AgentGeneratorDialog';


interface AgentListProps {
  agents: AgentProperties[];
}

export function AgentList({ agents }: AgentListProps) {
  const { selectedAgent, selectAgent, deleteAgent } = useAgentManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiCreateOpen, setIsAiCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentProperties | null>(null);

  function handleDelete(agentId: string) {
    deleteAgent(agentId).catch((error) => {
      toast({
        title: 'Error Deleting Agent',
        description: error.message,
        variant: 'destructive',
      });
    });
  }

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
      <AgentGeneratorDialog isOpen={isAiCreateOpen} onOpenChange={setIsAiCreateOpen} />

      <div className="flex h-full flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-muted/5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Active Registry</h2>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all">
                  <PlusCircle className="h-3.5 w-3.5 text-primary" />
                  Orchestrate
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-xl">
                <DropdownMenuItem onSelect={() => setIsCreateOpen(true)} className="gap-2 py-2.5">
                  <PlusCircle className="h-4 w-4 text-primary/60" />
                  <span className="text-xs font-semibold">New Blank Node</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsAiCreateOpen(true)} className="gap-2 py-2.5">
                  <Sparkles className="h-4 w-4 text-primary/60" />
                  <span className="text-xs font-semibold">Generate with AI</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>

        <div className="p-4 border-b bg-background relative group">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Filter registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-xl"
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2 pb-20">
            {filteredAgents.map((agent) => {
                const isActive = selectedAgent?.id === agent.id;
                return (
                    <div
                        key={agent.id}
                        className={cn(
                        'group flex cursor-pointer items-center justify-between rounded-[20px] p-3 transition-all duration-300 border border-transparent',
                        isActive
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                            : 'hover:bg-primary/5 hover:border-primary/20'
                        )}
                        onClick={() => selectAgent(agent.id)}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className={cn(
                            "h-10 w-10 shrink-0 rounded-xl border transition-all duration-500 group-hover:scale-110",
                            isActive ? "bg-white/20 border-white/20" : "bg-primary/5 border-border/40 shadow-sm"
                        )}>
                            <AvatarFallback className={cn(
                                "font-bold text-xs",
                                isActive ? "text-white" : "text-primary"
                            )}>
                            {agent.name?.charAt(0) || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs tracking-tight truncate">{agent.name}</div>
                            <div className={cn(
                                "text-[9px] font-bold uppercase tracking-widest truncate mt-0.5",
                                isActive ? "text-white/60" : "text-muted-foreground/60"
                            )}>
                                {agent.category || "General Node"}
                            </div>
                        </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                                        isActive ? "hover:bg-white/20" : "hover:bg-primary/10"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className={cn("h-4 w-4", isActive ? "text-white" : "text-muted-foreground")} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-2xl border-border/40">
                                <DropdownMenuItem onClick={() => setEditingAgent(agent)} className="gap-2 py-2">
                                    <Edit3 className="h-3.5 w-3.5 text-primary/60" />
                                    <span className="text-xs font-semibold">Modify Logic</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive gap-2 py-2">
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Offboard</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-headline font-bold tracking-tight">Offboard AI Entity?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-xs italic leading-relaxed">
                                                This will permanently decommission <span className="font-bold text-foreground not-italic">"{agent.name}"</span> from the registry. This operation is non-reversible.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="text-[10px] font-bold uppercase tracking-wider rounded-xl">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(agent.id)}
                                                className="bg-destructive hover:bg-destructive/90 text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-destructive/20"
                                            >
                                                Confirm Decommission
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            })}
          </div>
        </ScrollArea>

        {filteredAgents.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-40 space-y-4">
            <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center">
                <Search className="h-8 w-8 text-primary/60" />
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Empty</h3>
                <p className="text-[10px] italic max-w-[150px] mx-auto leading-relaxed">No matching nodes identified.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
