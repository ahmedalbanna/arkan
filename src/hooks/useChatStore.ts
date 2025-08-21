
'use client';

import { create } from 'zustand';
import type { User as FirebaseUser } from "firebase/auth";
import { ref, onValue, off, query, update } from 'firebase/database';
import { db } from '@/lib/firebaseConfig';
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
        const userConversationsRef = query(ref(db, `userConversations/${firebaseUser.uid}`));

        onValue(userConversationsRef, async (snapshot) => {
            if (!snapshot.exists()) {
                set({ chats: [], selectedChat: null });
                return;
            }
            const conversationIds = Object.keys(snapshot.val());
            const conversationPromises = conversationIds.map(id =>
                new Promise<ChatSession | null>((resolve) => {
                    const convoRef = ref(db, `conversations/${id}`);
                    onValue(convoRef, (convoSnapshot) => {
                        if (convoSnapshot.exists()) {
                            resolve({ id, ...convoSnapshot.val() });
                        } else {
                            resolve(null);
                        }
                    }, { onlyOnce: true }); // Fetch details once per convo ID
                })
            );

            const conversations = (await Promise.all(conversationPromises)).filter(Boolean) as ChatSession[];
            conversations.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());

            set(state => {
                 // If there's a selected chat, find its updated version and keep it selected.
                 const currentSelectedId = state.selectedChat?.id;
                 const newSelectedChat = currentSelectedId ? conversations.find(c => c.id === currentSelectedId) : conversations[0];
                 return { chats: conversations, selectedChat: newSelectedChat || null };
            });
        });
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
      if (chat) {
        get().resetUnreadCount(chat.id);
      }
      set({ selectedChat: chat });
    },

    addMessage: (chatId, message) => {
      const chatRef = ref(db, `conversations/${chatId}`);
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
        // Sort to bring the updated chat to the top
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
