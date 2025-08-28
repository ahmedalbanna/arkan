


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Inbox, User, Search, MessageSquare, Loader2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useInfiniteQuery } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createConversationApi } from '@/services';
import { toast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/hooks';
import { useRouter } from 'next/navigation';
import type { ChatSession, ChatMessage, AgentChatSession, UserProfile, Agent } from '@/lib/types';
import { useUsers } from '@/hooks';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgents } from '@/hooks';
// ...



interface ChatListProps {
  agents: Agent[];
  liveChats: ChatSession[];
  selectedChat: ChatSession | AgentChatSession | null;
  onSelectChat: (chat: ChatSession) => void;
  onSelectAgent: (agent: Agent) => void;
}


function NewChatDialog() {
    const [open, setOpen] = useState(false);
    const { firebaseUser, userProfile: adminProfile } = useAuth();

    const {
        data,
        isLoading: usersLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useUsers();

    const allUsers = data?.pages.flatMap(page => page.users) ?? [];

    const { createConversation } = useChatStore();
    const [isCreating, setIsCreating] = useState(false);

    const onSelectUser = async (user: UserProfile) => {
        if (!firebaseUser || !adminProfile) return;
        setIsCreating(true);
        try {
            const token = await firebaseUser.getIdToken();
            const conversation = await createConversationApi({
                participantIds: [firebaseUser.uid, user.id],
                participantNames: {
                    [firebaseUser.uid]: adminProfile.name || 'Admin',
                    [user.id]: user.name
                },
                title: `Chat with ${user.name}`
            }, token);
            createConversation(conversation);
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
                <Button size="sm"><PlusCircle className="me-2 h-4 w-4"/>New Chat</Button>
            </DialogTrigger>
            <DialogContent className="p-0">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle>Start a New Chat</DialogTitle>
                  <DialogDescription>
                    Select a user from the list to begin a conversation.
                  </DialogDescription>
                </DialogHeader>
                <Command>
                    <CommandInput placeholder="Search users by name or email..." />
                    <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                            {usersLoading && !data && <CommandItem><Loader2 className="me-2 h-4 w-4 animate-spin" />Loading users...</CommandItem>}
                            {allUsers?.map((user: UserProfile) => (
                                <CommandItem key={user.id} onSelect={() => onSelectUser(user)} disabled={isCreating}>
                                    <Avatar className="me-2 h-6 w-6">
                                        <AvatarImage src={user.profilePictureUrl}/>
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <span>{user.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">{user.email}</span>
                                    </div>
                                    {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {hasNextPage && (
                             <CommandItem onSelect={() => fetchNextPage()} className="justify-center text-sm text-muted-foreground cursor-pointer">
                                {isFetchingNextPage ? <Loader2 className="me-2 h-4 w-4 animate-spin"/> : null}
                                Load More
                            </CommandItem>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function LiveChatListItem({ chat, isSelected, onSelect }: { chat: ChatSession, isSelected: boolean, onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                'group flex items-start gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent w-full',
                isSelected && 'bg-accent'
            )}
        >
            <Avatar className="h-9 w-9 border">
                <AvatarFallback>{chat.title?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
                <p className="font-semibold truncate">{chat.title}</p>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>
            {chat.lastMessageTimestamp && (
                 <p className="text-xs text-muted-foreground self-start shrink-0">
                    {formatDistanceToNow(new Date(chat.lastMessageTimestamp), { addSuffix: true })}
                </p>
            )}
        </button>
    )
}

function AgentListItem({ agent, isSelected, onSelect }: { agent: Agent, isSelected: boolean, onSelect: () => void }) {
    const { agents, isLoaded } = useAgents();
    const Icon = agents.find(a => a.id === agent.id)?.icon || Bot;
    return (
        <button
            onClick={onSelect}
            className={cn(
                'group flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent w-full',
                isSelected && 'bg-accent'
            )}
        >
            <Icon className="h-5 w-5" />
            <div className="font-semibold">{agent.name}</div>
        </button>
    )
}

export function ChatList({ agents, liveChats, selectedChat, onSelectChat, onSelectAgent }: ChatListProps) {
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="flex h-full flex-col bg-muted/50">
      <div className="flex items-center justify-between p-4 border-b">
         <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="chats" className="gap-2"><MessageSquare className="h-4 w-4" /> Chats</TabsTrigger>
                <TabsTrigger value="agents" className="gap-2"><Bot className="h-4 w-4" /> Agents</TabsTrigger>
            </TabsList>
         </Tabs>
         <NewChatDialog />
      </div>

      <ScrollArea className="flex-1 p-2">
         <nav className="grid gap-1">
            {activeTab === 'chats' && (
                liveChats.length > 0 ? liveChats.map(chat => (
                    <LiveChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChat?.id === chat.id}
                        onSelect={() => onSelectChat(chat)}
                    />
                )) : (
                    <div className="text-center text-sm text-muted-foreground p-8">
                        <Inbox className="mx-auto h-8 w-8 mb-2" />
                        <p>No active conversations.</p>
                    </div>
                )
            )}
            {activeTab === 'agents' && (
                agents.length > 0 ? agents.map((agent) => (
                    <AgentListItem
                        key={agent.id}
                        agent={agent}
                        isSelected={selectedChat?.id === agent.id}
                        onSelect={() => onSelectAgent(agent)}
                    />
                )) : (
                    <div className="text-center text-sm text-muted-foreground p-8">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                        <p>Loading agents...</p>
                    </div>
                )
            )}
         </nav>
      </ScrollArea>
    </div>
  );
}

