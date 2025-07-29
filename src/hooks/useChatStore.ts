
'use client';

import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import { getDatabase, ref, onValue, off, push, serverTimestamp, query, orderByChild, limitToLast, update } from 'firebase/database';
import { app } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { initiateSupportChat, createConversationApi } from '@/services/chat-service';
import { Agent } from '@/lib/agents';


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
  agent?: Agent; // For agent training chats
}


export interface AgentChatSession extends ChatSession {
  agent: Agent;
}


interface ChatState {
  chats: ChatSession[];
  selectedChat: ChatSession | AgentChatSession | null;
  input: string;
  isChatOpen: boolean; // To control the floating widget
  isInitialized: boolean;
}

interface ChatActions {
  initialize: (firebaseUser: FirebaseUser | null) => Promise<void>;
  addMessage: (chatId: string, message: ChatMessage) => void;
  setInput: (input: string) => void;
  createConversation: (conversation: ChatSession) => void;
  setSelectedChat: (chat: ChatSession | AgentChatSession | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  removeChat: (chatId: string) => void;
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
        set((state) => {
            const existingChatIndex = state.chats.findIndex((c) => c.id === conversation.id);
            if (existingChatIndex !== -1) {
                // If a chat with the same ID exists, do nothing.
                // This prevents duplicates if the API and a local action both trigger creation.
                return { chats: state.chats };
            }
            const updatedChats = [conversation, ...state.chats];
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
      // Update the last message and timestamp in the specific chat session
      const db = getDatabase(app);
      const chatRef = ref(db, `conversations/${chatId}`);
      update(chatRef, {
        lastMessage: message.content,
        lastMessageTimestamp: new Date().toISOString()
      });

      // Also update the local state for immediate UI feedback
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

    removeChat: (chatId) => {
        set(state => {
            const newChats = state.chats.filter(c => c.id !== chatId);
            const newSelectedChat = state.selectedChat?.id === chatId ? (newChats[0] || null) : state.selectedChat;
            return {
                chats: newChats,
                selectedChat: newSelectedChat
            };
        });
    },

  })
);
