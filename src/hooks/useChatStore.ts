
'use client';

import { RealtimeDatabase } from '@/lib/firebase/client-init';
import { type AgentProperties } from '@/lib/models/agent';
import { Chat, type ChatProperties } from '@/lib/models/chat';
import type { Notification } from '@/lib/types';
import type { User as FirebaseUser } from "firebase/auth";
import { get as getDbData, limitToLast, off, onValue, orderByChild, query, ref, update, type DataSnapshot } from 'firebase/database';
import { create } from 'zustand';


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
  chats: Chat[];
  notifications: Notification[];
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
  getSelectedChat: () => Chat | null;
  _unsubscribe: (() => void) | null;
}

const getInitialState = (): ChatState => ({
  chats: [],
  notifications: [],
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
      const uid = firebaseUser.uid;

      // Listener for conversations
      const userConversationsRef = query(ref(RealtimeDatabase, `userConversations/${uid}`));
      const convoListener = onValue(userConversationsRef, async (snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
          set({ chats: [] });
          return;
        }
        const conversationIds = Object.keys(snapshot.val());
        const conversationPromises = conversationIds.map(id =>
          getDbData(ref(RealtimeDatabase, `conversations/${id}`)).then((convoSnapshot: DataSnapshot) =>
            convoSnapshot.exists() ? { id, ...convoSnapshot.val() } : null
          )
        );
        const rawConversations = (await Promise.all(conversationPromises)).filter(Boolean) as RawChatSession[];
        const conversations = rawConversations.map(c => new Chat(c as ChatProperties));
        conversations.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
        set({ chats: conversations });
      });

      // Listener for notifications
      const notificationsRef = query(ref(RealtimeDatabase, `notifications/${uid}`), orderByChild('createdAt'), limitToLast(20));
      const notificationListener = onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        const notificationsList: Notification[] = [];
        if (data) {
          Object.keys(data).forEach(key => {
            notificationsList.push({ id: key, ...data[key] });
          });
          notificationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        set({ notifications: notificationsList });
      });

      // Store unsubscribe functions to be called on cleanup
      get()._unsubscribe = () => {
        off(userConversationsRef, 'value', convoListener);
        off(notificationsRef, 'value', notificationListener);
      };
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

    getSelectedChat: () => {
      const { chats, selectedChatId } = get();
      return chats.find(c => c.id === selectedChatId) || null;
    },
    // Internal property for cleanup
    _unsubscribe: null as (() => void) | null,
  })
);

// Cleanup listeners when the app is closed or the user logs out
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const unsubscribe = useChatStore.getState()._unsubscribe;
    if (unsubscribe) {
      unsubscribe();
    }
  });
}
