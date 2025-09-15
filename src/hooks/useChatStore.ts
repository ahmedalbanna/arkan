'use client';

import { create } from 'zustand';
import type { User as FirebaseUser } from "firebase/auth";
import { ref, onValue, off, query, update, get as getDbData, type DataSnapshot } from 'firebase/database';
import { RealtimeDatabase } from '@/lib/firebase/client-init';
import { v4 as uuidv4 } from 'uuid';
import { initiateSupportChat, createConversationApi } from '@/services';
import { Agent, type AgentProperties } from '@/lib/models/agent';
import { Chat, type ChatProperties } from '@/lib/models/chat';
import { ChatMessage, type ChatMessageProperties } from '@/lib/models/chatMessage'; // Import ChatMessage model

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
  lastMessageTimestamp: any;
  participantIds: string[];
  participantNames: Record<string, string>;
  isSupportChat?: boolean;
  agent?: AgentProperties;
}


interface ChatState {
  chats: Chat[]; // Now stores Chat instances
  selectedChatId: string | null;
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
  setSelectedChatId: (chatId: string | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  removeChat: (chatId: string) => void;
  resetUnreadCount: (chatId: string) => void;
  // Selectors are now simpler
  getSelectedChat: () => Chat | null;
}

const getInitialState = (): ChatState => ({
  chats: [],
  selectedChatId: null,
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
                set({ chats: [], selectedChatId: null });
                return;
            }
            const conversationIds = Object.keys(snapshot.val());
            const conversationPromises = conversationIds.map(id =>
              getDbData(ref(RealtimeDatabase, `conversations/${id}`)).then((convoSnapshot: DataSnapshot) =>
                    convoSnapshot.exists() ? { id, ...convoSnapshot.val() } : null
                )
            );

            const rawConversations = (await Promise.all(conversationPromises)).filter(Boolean) as RawChatSession[];
            
            // Convert to Chat instances and sort
            const conversations = rawConversations.map(c => new Chat(c as ChatProperties));
            conversations.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());

            set(state => {
                 const currentSelectedId = state.selectedChatId;
                 const newSelectedChat = currentSelectedId ? conversations.find(c => c.id === currentSelectedId) : conversations[0];
                 return { chats: conversations, selectedChatId: newSelectedChat?.id || state.selectedChatId || null };
            });
        }, (error) => {
            console.error("Error listening to user conversations:", error);
            set({ chats: [], selectedChatId: null, isInitialized: false });
        });
    },

    createConversation: (rawConversation) => {
        set((state) => {
            const existingChatIndex = state.chats.findIndex((c) => c.id === rawConversation.id);
            if (existingChatIndex !== -1) {
                return { chats: state.chats };
            }
            const newChat = new Chat(rawConversation as ChatProperties); // Create instance here
            const updatedChats = [newChat, ...state.chats];
            updatedChats.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
            return {
                chats: updatedChats,
                selectedChatId: newChat.id, // Select the new chat
            };
        });
    },

    setSelectedChatId: (chatId) => {
      if (chatId) {
        get().resetUnreadCount(chatId);
      }
      set({ selectedChatId: chatId });
    },

    addMessage: (chatId, message) => {
      const chatRef = ref(RealtimeDatabase, `conversations/${chatId}`);
      update(chatRef, {
        lastMessage: message.content,
        lastMessageTimestamp: new Date().toISOString()
      });

      set((state) => {
        const isChatSelected = state.selectedChatId === chatId;
        // The list is already sorted, we just need to find and move the updated chat to the top
        let chatToUpdate = state.chats.find(c => c.id === chatId);
        if (chatToUpdate) {
            chatToUpdate.lastMessage = message.content;
            chatToUpdate.lastMessageTimestamp = new Date().toISOString();
        }
        const otherChats = state.chats.filter(c => c.id !== chatId);
        const newSortedChats = chatToUpdate ? [chatToUpdate, ...otherChats] : state.chats;
        
        return {
          chats: newSortedChats,
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
            const newSelectedChatId = state.selectedChatId === chatId ? (newChats[0]?.id || null) : state.selectedChatId;
            return {
                chats: newChats,
                selectedChatId: newSelectedChatId
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
    
    // NEW SIMPLIFIED SELECTOR
    getSelectedChat: () => {
      const { chats, selectedChatId } = get();
      return chats.find(c => c.id === selectedChatId) || null;
    },
  })
);
