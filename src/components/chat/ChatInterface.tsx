
'use client';

import { useState, useEffect } from 'react';
import { ChatList, type AgentChatSession } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';
import { useAgents } from '@/hooks/use-agents';
import { Agent } from '@/lib/agents';

export default function ChatInterface() {
  const { agents, isLoaded } = useAgents();
  const [agentChatSessions, setAgentChatSessions] = useState<AgentChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<AgentChatSession | null>(null);

  useEffect(() => {
    if (isLoaded && agents) {
      const sessions = agents.map(agent => ({
        id: agent.id,
        title: agent.name,
        agent: agent,
        messages: [],
      }));
      setAgentChatSessions(sessions);
      if (sessions.length > 0) {
        setSelectedChat(sessions[0]);
      }
    }
  }, [isLoaded, agents]);
  
  const addMessageToSession = (agentId: string, message: any) => {
      setAgentChatSessions(prev => 
        prev.map(session => 
            session.id === agentId 
                ? { ...session, messages: [...session.messages, message] }
                : session
        )
      );
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
          chats={agentChatSessions}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
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
