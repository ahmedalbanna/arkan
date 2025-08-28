
'use client';

import { create } from 'zustand';
import type { User as FirebaseUser } from "firebase/auth";
import { ref, onValue, off, query, update, get as getDbData, type DataSnapshot } from 'firebase/database';
import { RealtimeDatabase } from '@/lib/firebase/client-init'; // Assuming db is your initialized database instance
import { v4 as uuidv4 } from 'uuid';
import { initiateSupportChat, createConversationApi } from '@/services';
import { Agent } from '@/hooks';


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
  unreadCounts: Record<string, number>;
}

interface ChatActions {
  initialize: (firebaseUser: FirebaseUser | null) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  setInput: (input: string) => void;
  createConversation: (conversation: ChatSession) => void;
  setSelectedChat: (chat: ChatSession | AgentChatSession | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  removeChat: (chatId: string) => void;
  resetUnreadCount: (chatId: string) => void;
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

            const conversations = (await Promise.all(conversationPromises)).filter(Boolean) as ChatSession[];
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

        // This is a simplified return. In a real app, you'd manage this unsubscribe call
        // more carefully, e.g., when the user logs out.
        return () => off(userConversationsRef, 'value', listener);
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

      // Also update the local state for immediate UI feedback
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

    openChat: () => {
      const { selectedChat, resetUnreadCount } = get();
      if(selectedChat) {
          resetUnreadCount(selectedChat.id);
      }
      set({ isChatOpen: true });
    },
    closeChat: () => set({ isChatOpen: false }),
    toggleChat: () => {
        set(state => {
            const nextIsOpen = !state.isChatOpen;
            if (nextIsOpen && state.selectedChat) {
                get().resetUnreadCount(state.selectedChat.id);
            }
            return { isChatOpen: nextIsOpen };
        });
    },

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

  })
);
