
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { deleteConversationApi } from '@/services';
import { useChatStore } from './useChatStore';
import { toast } from './use-toast';
import { handleErrorUtility } from '@/lib/errorUtils';


export function useDeleteChat() {
    const { firebaseUser } = useAuth();
    const { removeChat } = useChatStore();

    return useMutation<any, Error, string>({
        mutationFn: async (chatId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteConversationApi(chatId, token);
        },
        onSuccess: (data, chatId) => {
            removeChat(chatId);
            toast({ title: "Chat Deleted", description: "The conversation has been removed." });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to delete chat");
        }
    });
}
