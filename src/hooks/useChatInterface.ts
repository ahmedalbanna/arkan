
'use client';

import { useEffect } from 'react';
import { useAgents } from '@/hooks';
import { Agent, type AgentProperties } from '@/lib/models/agent';
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/hooks';
import { createConversationApi } from '@/services';
import { toast } from '@/hooks';
import { Chat } from '@/lib/models/chat';

export function useChatInterface() {
  const { agents } = useAgents();
  const {
    getSelectedChat,
    setSelectedChat,
    getChats,
    createConversation,
    initialize,
    isInitialized
  } = useChatStore();
  const chats = getChats();
  const selectedChat = getSelectedChat();
  const { firebaseUser, userProfile } = useAuth();

  useEffect(() => {
    if (firebaseUser && !isInitialized) {
        initialize(firebaseUser);
    }
  }, [firebaseUser, isInitialized, initialize]);

  // Effect to select the first chat once loaded, if none is selected
  useEffect(() => {
    if (!selectedChat && chats.length > 0) {
      setSelectedChat(chats[0].toPlainObject());
    }
  }, [chats, selectedChat, setSelectedChat]);

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat.toPlainObject());
  }

  const handleSelectAgent = async (agent: Agent) => {
    if (!firebaseUser || !userProfile) {
        toast({ title: "Authentication Error", description: "You must be logged in to chat with an agent.", variant: "destructive" });
        return;
    }

    // Check if a chat with this agent already exists
    const existingChat = chats.find(c => c.agent?.id === agent.id);
    if (existingChat) {
        setSelectedChat(existingChat.toPlainObject());
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
            agent: agent as AgentProperties, // Pass plain object to API
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
    selectedChat, // This is now a Chat class instance or null
    handleSelectChat,
    handleSelectAgent,
  };
}
