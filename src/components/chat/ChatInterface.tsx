
'use client';

import { useState } from 'react';
import { ChatList, type ChatSession } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  // Example data, this would come from a state management store in a real app
  const [chats, setChats] = useState<ChatSession[]>([
    { id: '1', title: 'User Onboarding Flow', lastMessage: 'Okay, let\'s refine the component...', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '2', title: 'Database Schema for E-commerce', lastMessage: 'Can you add a "reviews" table?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '3', title: 'Marketing Copy for Ad Campaign', lastMessage: 'That sounds great, let\'s go with that.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  ]);

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: (chats.length + 1).toString(),
      title: `New Chat ${chats.length + 1}`,
      lastMessage: '...',
      timestamp: new Date(),
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full items-stretch"
    >
      <ResizablePanel
        defaultSize={25}
        minSize={20}
        maxSize={30}
        className={cn("min-w-[250px] max-w-[400px]")}
      >
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onNewChat={handleNewChat}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ConversationView chat={selectedChat} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
