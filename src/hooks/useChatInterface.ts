'use client';

import { useEffect } from 'react';
import { useAgents } from '@/hooks';
import type { Agent } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useChatStore, type AgentChatSession, type ChatSession } from '@/hooks';
import { createConversationApi } from '@/services';
import { toast } from '@/hooks';

export function useChatInterface() {
  const { agents } = useAgents();
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

  return {
    agents,
    chats,
    selectedChat,
    handleSelectChat,
    handleSelectAgent,
  };
}
