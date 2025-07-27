
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatSession } from '@/components/chat/ChatList';
import { format } from 'date-fns';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isToolResponse?: boolean;
}

interface ChatState {
  chats: ChatSession[];
  selectedChat: ChatSession | null;
  input: string;
  messages: ChatMessage[];
}

interface ChatActions {
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (contentChunk: string, isTool?: boolean) => void;
  setInput: (input: string) => void;
  createNewChat: () => void;
  setSelectedChat: (chat: ChatSession | null) => void;
}

const getInitialState = (): ChatState => ({
  chats: [],
  selectedChat: null,
  input: '',
  messages: [],
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
          messages: newChat.messages, // Set messages for the new chat
        }));
      },

      setSelectedChat: (chat) => {
        set({ selectedChat: chat, messages: chat ? chat.messages : [] });
      },
      
      addMessage: (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
      },
      
      updateLastMessage: (contentChunk, isTool = false) => {
        set((state) => {
            const newMessages = [...state.messages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                // If it's the first chunk, just set it. Otherwise, append.
                if (lastMessage.content === '') {
                     lastMessage.content = contentChunk;
                } else {
                     lastMessage.content += contentChunk;
                }
                lastMessage.isToolResponse = isTool;
                return { messages: newMessages };
            }
            return { messages: [...newMessages, { role: 'assistant', content: contentChunk, isToolResponse: isTool }] };
        });
      },
        
      setInput: (input) => set({ input }),

    }),
    {
      name: 'arkan-chat-store-v3', // new name to avoid conflicts
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);
