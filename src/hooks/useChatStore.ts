'use client';

import { create } from 'zustand';
import type { User as FirebaseUser } from "firebase/auth";
import { ref, onValue, off, query, update, get as getDbData, type DataSnapshot } from 'firebase/database';
import { RealtimeDatabase } from '@/lib/firebase/client-init';
import { v4 as uuidv4 } from 'uuid';
import { initiateSupportChat, createConversationApi } from '@/services';
import { Agent, type AgentProperties } from '@/lib/models/agent'; // Use our Agent class
import { Chat, type ChatProperties } from '@/lib/models/chat'; // NEW: Import our Chat class

// Keep original types for API/DB interactions
export interface RawChatMessage {
  senderId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
  isToolResponse?: boolean;
}

export interface RawChatSession {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  isSupportChat?: boolean;
  agent?: AgentProperties; // Use AgentProperties for raw data
}


interface ChatState {
  chats: RawChatSession[];
  selectedChat: RawChatSession | null;
  input: string;
  isChatOpen: boolean;
  isInitialized: boolean;
  unreadCounts: Record<string, number>;
}

interface ChatActions {
  initialize: (firebaseUser: FirebaseUser | null) => void;
  addMessage: (chatId: string, message: RawChatMessage) => void;
  setInput: (input: string) => void;
  createConversation: (conversation: RawChatSession) => void;
  setSelectedChat: (chat: RawChatSession | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  removeChat: (chatId: string) => void;
  resetUnreadCount: (chatId: string) => void;
  // NEW: Selectors to return class instances
  getChats: () => Chat[];
  getSelectedChat: () => Chat | null;
}

const getInitialState = (): ChatState => ({
  chats: [],
  selectedChat: null,
  input: '',
  isChatOpen: false,
  isInitialized: false,
  unreadCounts: {},
});


export const useChatStore = create<ChatState & ChatActions>()(
  (set, get) => ({
    ...getInitialState(),

    initialize: (firebaseUser) => {
        if (get().isInitialized || !firebaseUser) return;
        set({ isInitialized: true });
        const userConversationsRef = query(ref(RealtimeDatabase, `userConversations/${firebaseUser.uid}`));

        const listener = onValue(userConversationsRef, async (snapshot: DataSnapshot) => {
            if (!snapshot.exists()) {
                set({ chats: [], selectedChat: null });
                return;
            }
            const conversationIds = Object.keys(snapshot.val());
            const conversationPromises = conversationIds.map(id =>
              getDbData(ref(RealtimeDatabase, `conversations/${id}`)).then((convoSnapshot: DataSnapshot) =>
                    convoSnapshot.exists() ? { id, ...convoSnapshot.val() } : null
                )
            );

            const conversations = (await Promise.all(conversationPromises)).filter(Boolean) as RawChatSession[];
            conversations.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
            set(state => {
                 const currentSelectedId = state.selectedChat?.id;
                 const newSelectedChat = currentSelectedId ? conversations.find(c => c.id === currentSelectedId) : conversations[0];
                 return { chats: conversations, selectedChat: newSelectedChat || state.selectedChat || null };
            });
        }, (error) => {
            console.error("Error listening to user conversations:", error);
            set({ chats: [], selectedChat: null, isInitialized: false });
        });
    },

    createConversation: (conversation) => {
        set((state) => {
            const existingChatIndex = state.chats.findIndex((c) => c.id === conversation.id);
            if (existingChatIndex !== -1) {
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
      if (chat) {
        get().resetUnreadCount(chat.id);
      }
      set({ selectedChat: chat });
    },

    addMessage: (chatId, message) => {
      const chatRef = ref(RealtimeDatabase, `conversations/${chatId}`);
      update(chatRef, {
        lastMessage: message.content,
        lastMessageTimestamp: new Date().toISOString()
      });

      set((state) => {
        const isChatSelected = state.selectedChat?.id === chatId;
        const newChats = state.chats.map(chat =>
          chat.id === chatId
            ? { ...chat, lastMessage: message.content, lastMessageTimestamp: new Date().toISOString() }
            : chat
        );
        newChats.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
        return {
          chats: newChats,
          unreadCounts: isChatSelected ? state.unreadCounts : {
              ...state.unreadCounts,
              [chatId]: (state.unreadCounts[chatId] || 0) + 1,
          },
        };
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

    resetUnreadCount: (chatId: string) => {
        set(state => ({
            unreadCounts: {
                ...state.unreadCounts,
                [chatId]: 0,
            }
        }));
    },

    // NEW SELECTOR IMPLEMENTATIONS
    getChats: () => {
      const { chats } = get();
      return chats.map(c => new Chat(c as ChatProperties));
    },

    getSelectedChat: () => {
      const { selectedChat } = get();
      if (!selectedChat) return null;
      return new Chat(selectedChat as ChatProperties);
    },
  })
);