
'use client';

import { useState, useEffect } from 'react';
import { ChatList } from './ChatList';
import { ConversationView } from './ConversationView';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { cn } from '@/lib/utils';
import { useAgents } from '@/hooks/use-agents';
import { Agent } from '@/hooks/use-agents';
import { useAuth } from '@/context/AuthContext';
import { useChatStore, type AgentChatSession, type ChatSession } from '@/hooks/useChatStore';
import { createConversationApi } from '@/services/chat-service';
import { toast } from '@/hooks/use-toast';

export default function ChatInterface() {
  const { agents, isLoaded } = useAgents();
  const {
    selectedChat,
    setSelectedChat,
    chats,
    createConversation,
    initialize,
    isInitialized
  } = useChatStore();
  const { firebaseUser, userProfile } = useAuth();

  useEffect(() => {
    if (firebaseUser && !isInitialized) {
        initialize(firebaseUser);
    }
  }, [firebaseUser, isInitialized, initialize]);

  // Effect to select the first chat once loaded, if none is selected
  useEffect(() => {
    if (!selectedChat && chats.length > 0) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat, setSelectedChat]);


  const handleSelectChat = (chat: ChatSession | AgentChatSession) => {
    setSelectedChat(chat);
  }

  const handleSelectAgent = async (agent: Agent) => {
    if (!firebaseUser || !userProfile) {
        toast({ title: "Authentication Error", description: "You must be logged in to chat with an agent.", variant: "destructive" });
        return;
    }

    // Check if a chat with this agent already exists
    const existingChat = chats.find(c => c.agent?.id === agent.id);
    if (existingChat) {
        setSelectedChat(existingChat);
        return;
    }

    // Create a new conversation in the database
    try {
        const token = await firebaseUser.getIdToken();
        const participantIds = [firebaseUser.uid, `ai-agent-${agent.id}`];
        const newConversationData = {
            participantIds,
            participantNames: {
                [firebaseUser.uid]: userProfile.name,
                [`ai-agent-${agent.id}`]: agent.name,
            },
            title: agent.name,
            agent: agent, // Store agent info in the conversation
        };
        const conversation = await createConversationApi(newConversationData, token);
        createConversation(conversation);
    } catch (error: any) {
        toast({ title: "Error starting chat", description: error.message, variant: "destructive" });
    }
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
