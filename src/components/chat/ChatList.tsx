
'use client';

import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Bot, Inbox, Loader2, MessageSquare, PlusCircle, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNewChatDialog } from '@/hooks/use-new-chat-dialog';
import { Agent } from '@/lib/models/agent';
import { Chat } from '@/lib/models/chat';
import { formatDistanceToNow } from 'date-fns';


interface ChatListProps {
    agents: Agent[];
    liveChats: Chat[]; // Now expects Chat[]
    selectedChat: Chat | null; // Now expects Chat | null
    onSelectChat: (chat: Chat) => void;
    onSelectAgent: (agent: Agent) => void;
}


function NewChatDialog() {
    const {
        open,
        setOpen,
        allUsers,
        usersLoading,
        hasNextPage,
        isFetchingNextPage,
        isCreating,
        fetchNextPage,
        onSelectUser,
    } = useNewChatDialog();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="gradient"
                    className="hover:shadow-glow transition-all duration-200"
                >
                    <PlusCircle className="me-2 h-4 w-4" />
                    New Chat
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-md">
                <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-headline">Start a New Chat</DialogTitle>
                            <DialogDescription className="text-sm">
                                Select a user from the list to begin a conversation.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <Command className="max-h-[400px]">
                    <CommandInput
                        placeholder="Search users by name or email..."
                        className="border-0 focus:ring-0"
                    />
                    <CommandList>
                        <CommandEmpty className="py-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Users className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">No users found.</p>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {usersLoading && !allUsers.length && (
                                <CommandItem className="justify-center">
                                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                    Loading users...
                                </CommandItem>
                            )}
                            <StaggeredAnimation animation="fade-in-up" staggerDelay={50}>
                                {allUsers?.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        onSelect={() => onSelectUser(user)}
                                        disabled={isCreating}
                                        className="flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors"
                                    >
                                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                                            <AvatarImage src={user.profilePictureUrl} />
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold">
                                                {user.getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow min-w-0">
                                            <div className="font-medium truncate">{user.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                        </div>
                                        {isCreating && (
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        )}
                                    </CommandItem>
                                ))}
                            </StaggeredAnimation>
                        </CommandGroup>
                        {hasNextPage && (
                            <CommandItem
                                onSelect={() => fetchNextPage()}
                                className="justify-center text-sm text-muted-foreground cursor-pointer hover:bg-primary/5 transition-colors"
                            >
                                {isFetchingNextPage ? (
                                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Load More
                            </CommandItem>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function LiveChatListItem({ chat, isSelected, onSelect }: { chat: Chat, isSelected: boolean, onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                'group flex items-start gap-3 rounded-lg p-3 text-left text-sm transition-all duration-200 hover:bg-primary/5 hover:shadow-soft w-full',
                isSelected && 'bg-primary/10 shadow-soft border border-primary/20'
            )}
        >
            <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-white font-semibold group-hover:scale-105 transition-transform">
                    {chat.title?.charAt(0) || '?'}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate min-w-0">
                <p className="font-semibold truncate group-hover:text-primary transition-colors">{chat.title}</p>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>
            {chat.lastMessageTimestamp && (
                <div className="flex flex-col items-end gap-1 self-start shrink-0">
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.lastMessageTimestamp), { addSuffix: true })}
                    </p>
                </div>
            )}
        </button>
    )
}

function AgentListItem({ agent, isSelected, onSelect }: { agent: Agent, isSelected: boolean, onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                'group flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all duration-200 hover:bg-primary/5 hover:shadow-soft w-full',
                isSelected && 'bg-primary/10 shadow-soft border border-primary/20'
            )}
        >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold group-hover:text-primary transition-colors">{agent.name}</div>
                <div className="text-xs text-muted-foreground truncate">{agent.description}</div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                AI
            </Badge>
        </button>
    )
}

export function ChatList({ agents, liveChats, selectedChat, onSelectChat, onSelectAgent }: ChatListProps) {
    const [activeTab, setActiveTab] = useState('chats');

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-background to-primary/5">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-blue-500/5">
                <AnimatedContainer animation="fade-in-down" delay={200}>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                                value="chats"
                                className="gap-2 transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:shadow-glow"
                            >
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">Chats</span>
                                <span className="sm:hidden">Chats</span>
                                {liveChats.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 justify-center p-0 text-xs">
                                        {liveChats.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="agents"
                                className="gap-2 transition-all duration-200 hover:shadow-soft hover:scale-105 data-[state=active]:shadow-glow"
                            >
                                <Bot className="h-4 w-4" />
                                <span className="hidden sm:inline">Agents</span>
                                <span className="sm:hidden">AI</span>
                                {agents.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 justify-center p-0 text-xs">
                                        {agents.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </AnimatedContainer>
                <AnimatedContainer animation="fade-in-down" delay={400}>
                    <NewChatDialog />
                </AnimatedContainer>
            </div>

            <ScrollArea className="flex-1 p-2">
                <nav className="grid gap-2">
                    {activeTab === 'chats' && (
                        <AnimatedContainer animation="fade-in-up" delay={600}>
                            {liveChats.length > 0 ? (
                                <StaggeredAnimation animation="fade-in-up" staggerDelay={100}>
                                    {liveChats.map(chat => (
                                        <LiveChatListItem
                                            key={chat.id}
                                            chat={chat}
                                            isSelected={selectedChat?.id === chat.id}
                                            onSelect={() => onSelectChat(chat)}
                                        />
                                    ))}
                                </StaggeredAnimation>
                            ) : (
                                <Card variant="glass" className="p-8 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 rounded-full bg-gradient-to-br from-muted to-muted-foreground">
                                            <Inbox className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">No active conversations</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Start a new chat to begin messaging
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </AnimatedContainer>
                    )}
                    {activeTab === 'agents' && (
                        <AnimatedContainer animation="fade-in-up" delay={600}>
                            {agents.length > 0 ? (
                                <StaggeredAnimation animation="fade-in-up" staggerDelay={100}>
                                    {agents.map((agent) => (
                                        <AgentListItem
                                            key={agent.id}
                                            agent={agent}
                                            isSelected={selectedChat?.id === agent.id}
                                            onSelect={() => onSelectAgent(agent)}
                                        />
                                    ))}
                                </StaggeredAnimation>
                            ) : (
                                <Card variant="glass" className="p-8 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary-600">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Loading AI Agents</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Please wait while we load the available agents
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </AnimatedContainer>
                    )}
                </nav>
            </ScrollArea>
        </div>
    );
}
