
'use client';

import type { ChatSession } from "@/hooks/useChatStore";
import type { Agent } from "@/lib/agents";

interface CreateConversationData {
    participantIds: string[];
    participantNames: Record<string, string>;
    title?: string;
    isSupportChat?: boolean;
    agent?: Agent;
}

export async function createConversationApi(data: CreateConversationData, token: string): Promise<ChatSession> {
    if (!token) throw new Error("User not authenticated");

    const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create conversation');
    }
    return await response.json();
}

export async function initiateSupportChat(token: string): Promise<ChatSession> {
    if (!token) throw new Error("User not authenticated");

    const response = await fetch('/api/support-chat/initiate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate support chat');
    }
    return await response.json();
}

export async function deleteConversationApi(chatId: string, token: string): Promise<{ message: string }> {
     if (!token) throw new Error("User not authenticated");
     const response = await fetch(`/api/conversations/${chatId}`, {
         method: 'DELETE',
         headers: {
             'Authorization': `Bearer ${token}`
         },
     });

     if (!response.ok) {
         const error = await response.json();
         throw new Error(error.message || 'Failed to delete conversation');
     }
     return await response.json();
}
