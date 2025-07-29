
'use client';

import { useState, useEffect } from 'react';
import { ChatList } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';
import { useAgents } from '@/hooks/use-agents';
import { Agent } from '@/lib/agents';
import { useAuth } from '@/context/AuthContext';
import { useChatStore, type AgentChatSession, type ChatSession } from '@/hooks/useChatStore';

export default function ChatInterface() {
  const { agents, isLoaded } = useAgents();
  const { 
    selectedChat, 
    setSelectedChat,
    chats,
    createConversation,
    openChat,
    initialize,
    isInitialized
  } = useChatStore();
  const { firebaseUser, userProfile } = useAuth();
  
  useEffect(() => {
    if (firebaseUser && !isInitialized) {
        initialize(firebaseUser);
    }
  }, [firebaseUser, isInitialized, initialize]);


  const handleSelectChat = (chat: ChatSession | AgentChatSession) => {
    setSelectedChat(chat);
  }

  const handleSelectAgent = (agent: Agent) => {
    // This is for the admin agent training chat.
    // We create a temporary client-side session to hold the conversation.
    const tempSession: AgentChatSession = {
        id: agent.id,
        title: agent.name,
        agent: agent,
        messages: [],
        lastMessage: '',
        lastMessageTimestamp: new Date().toISOString(),
        participantIds: [],
        participantNames: {},
    };
    setSelectedChat(tempSession);
  }

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
          agents={agents}
          liveChats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onSelectAgent={handleSelectAgent}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ConversationView 
            chat={selectedChat}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
