'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/infrastructure/api/ApiService';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function useProjectChat() {
  const { firebaseUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string, projectContext: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = { role: 'user', content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await apiService<{ projectContext: string; userMessage: string; history: Message[] }, { response: string }>({
        endpoint: '/api/chat/project-consultant',
        method: 'POST',
        data: {
          projectContext,
          userMessage,
          history: messages,
        },
      });

      const assistantMessage: Message = { role: 'assistant', content: response.response };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
  };
}
