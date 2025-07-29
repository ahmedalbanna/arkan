
'use client';

import { useState, useEffect } from 'react';
import { ChatList, type AgentChatSession } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';
import { useAgents } from '@/hooks/use-agents';
import { Agent } from '@/lib/agents';
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/hooks/useChatStore';

export default function ChatInterface() {
  const { agents, isLoaded } = useAgents();
  const [agentChatSessions, setAgentChatSessions] = useState<AgentChatSession[]>([]);
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

  const addMessageToSession = (agentId: string, message: any) => {
      setAgentChatSessions(prev => 
        prev.map(session => 
            session.id === agentId 
                ? { ...session, messages: [...session.messages, message] }
                : session
        )
      );
  }

  const handleSelectAgent = (agent: Agent) => {
    // This is for the admin agent training chat.
    // We create a temporary client-side session to hold the conversation.
    const tempSession: AgentChatSession = {
        id: agent.id,
        title: agent.name,
        agent: agent,
        messages: [],
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
          selectedAgent={selectedChat?.agent}
          onSelectAgent={handleSelectAgent}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <ConversationView 
            chat={selectedChat} 
            onNewMessage={addMessageToSession}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
