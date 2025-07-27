
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isToolResponse?: boolean; // New optional field
}

interface ChatState {
  messages: ChatMessage[];
  input: string;
}

interface ChatActions {
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (chunk: string, isToolResponse?: boolean) => void;
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
      updateLastMessage: (chunk, isToolResponse = false) =>
        set((state) => {
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                const updatedMessage = {
                    ...lastMessage,
                    content: lastMessage.content + chunk,
                    isToolResponse: lastMessage.isToolResponse || isToolResponse,
                };
                return { messages: [...state.messages.slice(0, -1), updatedMessage] };
            }
            return state; // No change if last message isn't from assistant
        }),
      setInput: (input) => set({ input }),
      clearChat: () => set({ messages: [initialState.messages[0]], input: '' }),
    }),
    {
      name: 'arkan-chat-store',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage to clear on browser close
    }
  )
);
