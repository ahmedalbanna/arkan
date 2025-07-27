
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatSession } from '@/components/chat/ChatList';
import { format } from 'date-fns';

interface ChatState {
  chats: ChatSession[];
  selectedChat: ChatSession | null;
  input: string;
}

interface ChatActions {
  addMessage: (chatId: string, message: ChatMessage) => void;
  setInput: (input: string) => void;
  createNewChat: () => void;
  setSelectedChat: (chat: ChatSession | null) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}


const getInitialState = (): ChatState => ({
  chats: [
     {
      id: '1',
      title: 'Appendices',
      lastMessage: 'Hi there! How can I assist you today?',
      timestamp: new Date('2025-07-27T11:03:00'),
      messages: [{ role: 'assistant', content: 'Hi there! How can I assist you today?' }]
    }
  ],
  selectedChat: null,
  input: '',
});


export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      createNewChat: () => {
        const newChat: ChatSession = {
          id: new Date().toISOString(),
          title: 'New Chat',
          timestamp: new Date(),
          lastMessage: '...',
          messages: [{ role: 'assistant', content: 'How can I help you today?' }],
        };
        set(state => ({
          chats: [newChat, ...state.chats],
          selectedChat: newChat,
        }));
      },

      setSelectedChat: (chat) => set({ selectedChat: chat }),

      addMessage: (chatId, message) =>
        set(state => {
          const updatedChats = state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message.content,
                timestamp: new Date(),
              };
            }
            return chat;
          });
          return { chats: updatedChats };
        }),
        
      setInput: (input) => set({ input }),

    }),
    {
      name: 'arkan-chat-store-v2', // new name to avoid conflicts
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);
