
'use client';

import { useState, useEffect } from 'react';
import { ChatList, type ChatSession } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';
import { useSearchParams } from 'next/navigation';
import { useAgents } from '@/hooks/use-agents';

export default function ChatInterface() {
  const { selectedChat, setSelectedChat, createNewChat, chats } = useChatStore();
  const searchParams = useSearchParams();
  const { getAgent } = useAgents();

  useEffect(() => {
    const agentId = searchParams.get('agentId');
    if (agentId) {
      // Find if a chat for this agent already exists
      const existingChat = chats.find(c => c.agentId === agentId);
      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create a new chat for this agent
        const agent = getAgent(agentId);
        createNewChat({
          agentId,
          title: agent ? `${agent.name} Chat` : `Chat with ${agentId}`
        });
      }
    }
  }, [searchParams, chats, setSelectedChat, createNewChat, getAgent]);

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
          onNewChat={() => createNewChat()}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ConversationView chat={selectedChat} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
