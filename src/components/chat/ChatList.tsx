
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Bot, Inbox, User, Search, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { AGENTS, Agent } from '@/lib/agents';
import { useUsers } from '@/hooks/use-user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { createConversationApi } from '@/services/chat-service';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/hooks/useChatStore';
import { useRouter } from 'next/navigation';

export interface AgentChatSession {
  id: string;
  title: string;
  agent: Agent;
  messages: any[];
}

interface ChatListProps {
  agents: Agent[];
  selectedAgent: Agent | null | undefined;
  onSelectAgent: (agent: Agent) => void;
}


function NewChatDialog() {
    const [open, setOpen] = useState(false);
    const { data: users, isLoading: usersLoading } = useUsers();
    const { firebaseUser, userProfile: adminProfile } = useAuth();
    const { createConversation, openChat } = useChatStore();
    const [isCreating, setIsCreating] = useState(false);

    const onSelectUser = async (user: any) => {
        if (!firebaseUser || !adminProfile) return;
        setIsCreating(true);
        try {
            const token = await firebaseUser.getIdToken();
            const conversation = await createConversationApi({
                participantIds: [firebaseUser.uid, user.id],
                participantNames: {
                    [firebaseUser.uid]: adminProfile.name || 'Admin',
                    [user.id]: user.name,
                },
                title: `Chat with ${user.name}`
            }, token);
            createConversation(conversation);
            openChat();
            setOpen(false); // Close dialog on success
        } catch (error: any) {
            toast({ title: "Error starting chat", description: error.message, variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">New Chat</Button>
            </DialogTrigger>
            <DialogContent className="p-0">
                <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                            {usersLoading && <CommandItem><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</CommandItem>}
                            {users?.map(user => (
                                <CommandItem key={user.id} onSelect={() => onSelectUser(user)}>
                                    <Avatar className="mr-2 h-6 w-6">
                                        <AvatarImage src={user.profilePictureUrl}/>
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}

export function ChatList({ agents, selectedAgent, onSelectAgent }: ChatListProps) {
  
  return (
    <div className="flex h-full flex-col bg-muted/50">
      <div className="flex items-center justify-between p-4 border-b">
         <Tabs defaultValue="chats">
            <TabsList>
                <TabsTrigger value="chats" className="gap-2"><Bot className="h-4 w-4" /> Agents</TabsTrigger>
                <TabsTrigger value="inbox" disabled><Inbox className="h-4 w-4" /> Inbox</TabsTrigger>
            </TabsList>
         </Tabs>
         <NewChatDialog />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
         <nav className="grid gap-1">
            {agents.map((agent) => {
                const Icon = AGENTS.find(a => a.id === agent.id)?.icon || Bot;
                return (
                    <button
                        key={agent.id}
                        onClick={() => onSelectAgent(agent)}
                        className={cn(
                            'group flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent',
                            selectedAgent?.id === agent.id && 'bg-accent'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <div className="font-semibold">{agent.name}</div>
                    </button>
                )
            })}
         </nav>
        {agents.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-8">
                <p>No agents found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
