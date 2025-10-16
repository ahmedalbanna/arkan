
'use client';

import type { RawChatSession } from "@/hooks";
import { AgentProperties } from '@/lib/models/agent';


interface CreateConversationData {
    participantIds: string[];
    participantNames: Record<string, string>;
    title?: string;
    isSupportChat?: boolean;
    agent?: AgentProperties;
}

export async function createConversationApi(data: CreateConversationData, token: string): Promise<RawChatSession> {
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

export async function initiateSupportChat(token: string): Promise<RawChatSession> {
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

interface AgentChatApiVariables {
    agentId: string;
    message: string;
    conversationId: string;
    token: string;
}

export async function agentChatApi(variables: AgentChatApiVariables) {
    const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${variables.token}`,
        },
        body: JSON.stringify({
            agentId: variables.agentId,
            message: variables.message,
            conversationId: variables.conversationId
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response from agent.');
    }
    return await response.json();
}
