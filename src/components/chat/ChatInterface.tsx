
'use client';

import { useState } from 'react';
import { ChatList, type ChatSession } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';

export default function ChatInterface() {
  const { selectedChat, setSelectedChat, createNewChat, chats } = useChatStore();

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
          onNewChat={createNewChat}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ConversationView chat={selectedChat} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
