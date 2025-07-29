
'use client';

import { Button } from '../ui/button';
import { Bot, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { AGENTS, Agent } from '@/lib/agents';

export interface AgentChatSession {
  id: string;
  title: string;
  agent: Agent;
  messages: any[];
}

interface ChatListProps {
  chats: AgentChatSession[];
  selectedChat: AgentChatSession | null;
  onSelectChat: (chat: AgentChatSession) => void;
}

export function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  
  return (
    <div className="flex h-full flex-col bg-muted/50">
      <div className="flex items-center justify-between p-4 border-b">
         <Tabs defaultValue="chats">
            <TabsList>
                <TabsTrigger value="chats" className="gap-2"><Bot className="h-4 w-4" /> Agents</TabsTrigger>
                <TabsTrigger value="inbox" disabled><Inbox className="h-4 w-4" /> Inbox</TabsTrigger>
            </TabsList>
         </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
         <nav className="grid gap-1">
            {chats.map((chat) => {
                const Icon = AGENTS.find(a => a.id === chat.id)?.icon || Bot;
                return (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={cn(
                            'group flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent',
                            selectedChat?.id === chat.id && 'bg-accent'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <div className="font-semibold">{chat.title}</div>
                    </button>
                )
            })}
         </nav>
        {chats.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-8">
                <p>No agents found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
