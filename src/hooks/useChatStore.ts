
'use client';

import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import { getDatabase, ref, onValue, off, push, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import { app } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { initiateSupportChat, createConversationApi } from '@/services/chat-service';


export interface ChatMessage {
  senderId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
  isToolResponse?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  isSupportChat?: boolean;
  messages: ChatMessage[];
}

interface ChatState {
  chats: ChatSession[];
  selectedChat: ChatSession | null;
  input: string;
  isChatOpen: boolean; // To control the floating widget
  isInitialized: boolean;
}

interface ChatActions {
  initialize: (firebaseUser: FirebaseUser | null) => Promise<void>;
  addMessage: (chatId: string, message: ChatMessage) => void;
  setInput: (input: string) => void;
  createConversation: (conversation: ChatSession) => void;
  setSelectedChat: (chat: ChatSession | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const getInitialState = (): ChatState => ({
  chats: [],
  selectedChat: null,
  input: '',
  isChatOpen: false,
  isInitialized: false,
});


export const useChatStore = create<ChatState & ChatActions>()(
  (set, get) => ({
    ...getInitialState(),

    initialize: async (firebaseUser) => {
      if (get().isInitialized || !firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch('/api/conversations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const serverChats: ChatSession[] = await response.json();
           serverChats.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
          set({ chats: serverChats, isInitialized: true, selectedChat: serverChats[0] || null });
        } else {
          console.error('Failed to fetch initial chats');
          set({ isInitialized: true });
        }
      } catch (error) {
         console.error('Error initializing chat store:', error);
         set({ isInitialized: true });
      }
    },

    createConversation: (conversation) => {
      set(state => {
          // Check if a conversation with the same ID already exists.
          const existingChatIndex = state.chats.findIndex(c => c.id === conversation.id);
          let updatedChats;

          if (existingChatIndex > -1) {
              // If it exists, update it. This is useful if the title or participants changed.
              updatedChats = [...state.chats];
              updatedChats[existingChatIndex] = conversation;
          } else {
              // If it doesn't exist, add it to the start of the list.
              updatedChats = [conversation, ...state.chats];
          }

          // Sort chats by lastMessageTimestamp to ensure the most recent is first
          updatedChats.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());

          return {
              chats: updatedChats,
              selectedChat: conversation,
          };
      });
    },

    setSelectedChat: (chat) => {
      set({ selectedChat: chat });
    },
    
    addMessage: (chatId, message) => {
      set((state) => {
        const newChats = state.chats.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: message.content, lastMessageTimestamp: new Date().toISOString() } 
            : chat
        );
        // Sort to bring the updated chat to the top
        newChats.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
        return { chats: newChats };
      });
    },
    
    setInput: (input) => set({ input }),
    
    openChat: () => set({ isChatOpen: true }),
    closeChat: () => set({ isChatOpen: false }), 
    toggleChat: () => set(state => ({ isChatOpen: !state.isChatOpen })),
  })
);
