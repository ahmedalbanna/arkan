
'use client';

import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Edit2, MessageSquare, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  isSupportChat?: boolean; // To identify support chats for the user widget
  isTemporary?: boolean; // To identify chats not yet saved to DB
  messages: { role: 'user' | 'assistant'; content: string }[];
}

interface ChatListProps {
  chats: ChatSession[];
  selectedChat: ChatSession | null;
  onSelectChat: (chat: ChatSession) => void;
  onNewChat: () => void;
}

export function ChatList({ chats, selectedChat, onSelectChat, onNewChat }: ChatListProps) {
  // Group chats by date
  const groupedChats = chats.reduce((groups, chat) => {
    // Don't show temporary chats in the admin list
    if (chat.isTemporary) return groups;

    const date = format(new Date(chat.lastMessageTimestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(chat);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  const sortedDates = Object.keys(groupedChats).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  return (
    <div className="flex h-full flex-col bg-muted/50">
      <div className="flex items-center justify-between p-4 border-b">
         <Tabs defaultValue="chats">
            <TabsList>
                <TabsTrigger value="chats" className="gap-2"><MessageSquare className="h-4 w-4" /> Chats</TabsTrigger>
                <TabsTrigger value="inbox" disabled><Inbox className="h-4 w-4" /> Inbox</TabsTrigger>
            </TabsList>
         </Tabs>
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNewChat}>
            <Edit2 className="h-4 w-4" />
         </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sortedDates.map(date => (
          <div key={date}>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </div>
             <nav className="grid gap-1">
                {groupedChats[date].map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={cn(
                            'flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent',
                            selectedChat?.id === chat.id && 'bg-accent'
                        )}
                    >
                         <div className="flex w-full items-center">
                            <div className="font-semibold">{chat.title}</div>
                            <div className="ml-auto text-xs text-muted-foreground">
                                {format(new Date(chat.lastMessageTimestamp), 'p')}
                            </div>
                        </div>
                    </button>
                ))}
             </nav>
          </div>
        ))}
        {chats.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-8">
                <p>No chats yet.</p>
            </div>
        )}
      </div>
    </div>
  );
}
