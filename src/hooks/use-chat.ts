
'use client';

import { useMutation } from '@tanstack/react-query';

import { agentChatApi, deleteConversationApi } from '@/services';
import { useChatStore } from './useChatStore';
import { useToast } from './use-toast';
import { handleErrorUtility } from '@/lib/errorUtils';
import { useAuth } from '@/context/AuthContext';


export function useDeleteChat() {
    const { removeChat } = useChatStore();

    return useMutation<any, Error, string>({
        // The `chatId` is passed directly to the service function.
        // `authenticatedFetch` will handle the token automatically.
        mutationFn: deleteConversationApi,
        onSuccess: (data, chatId) => {
            removeChat(chatId);
            toast({ title: "Chat Deleted", description: "The conversation has been removed." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to delete chat");
        }
    });
}

export function useAgentChat() {
    const { refetchUser } = useAuth();

    return useMutation({
        // The variables object (without the token) is passed to the API service.
        // `authenticatedFetch` inside `agentChatApi` handles the auth.
        mutationFn: agentChatApi,
        onSuccess: () => {
            refetchUser(); // Update credits on successful interaction
        },
        onError: (error: Error) => {
            // Use the centralized error handler for consistency
            handleErrorUtility(error, 'Failed to get response from agent.');
        }
    });
}
