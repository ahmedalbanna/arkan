
'use client';

import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { Plus, MessageSquare, Inbox, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatListProps {
  chats: ChatSession[];
  selectedChat: ChatSession | null;
  onSelectChat: (chat: ChatSession) => void;
  onNewChat: () => void;
}

export function ChatList({ chats, selectedChat, onSelectChat, onNewChat }: ChatListProps) {
  return (
    <div className="flex h-full flex-col bg-muted/50">
      <div className="flex items-center justify-between p-4 border-b">
         <h2 className="text-lg font-semibold">Chats</h2>
         <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
         </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="grid gap-1 p-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent',
                selectedChat?.id === chat.id && 'bg-accent'
              )}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{chat.title}</div>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                  </div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {chat.lastMessage}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t">
        <Button className="w-full" onClick={onNewChat}>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    </div>
  );
}
