'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { container } from '@/infrastructure/di/container';
import { ReportApiClient, ChatMessage } from '@/modules/ai-content/adapters/api-client/ReportApiClient';

export interface Message extends ChatMessage {}

export function useProjectChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string, projectContext: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = { role: 'user', content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const client = container.resolve(ReportApiClient);
      const result = await client.projectConsultantChat({
        projectContext,
        userMessage,
        history: messages as ChatMessage[],
      });

      if (result.isFailure) throw result.error;
      
      const assistantMessage: Message = { role: 'assistant', content: result.getValue().response };
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
