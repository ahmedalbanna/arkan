
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  input: string;
}

interface ChatActions {
  addMessage: (message: ChatMessage) => void;
  setInput: (input: string) => void;
  clearChat: () => void;
}

const initialState: ChatState = {
  messages: [{ role: 'assistant', content: "Hello! How can I help you refine your project today?" }],
  input: '',
};

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      ...initialState,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setInput: (input) => set({ input }),
      clearChat: () => set({ messages: [initialState.messages[0]], input: '' }),
    }),
    {
      name: 'arkan-chat-store',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage to clear on browser close
    }
  )
);
