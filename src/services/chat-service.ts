
'use client';

import type { RawChatSession } from "@/hooks";
import { authenticatedFetch } from "@/lib/api-client";
import { AgentProperties } from '@/lib/models/agent';


interface CreateConversationData {
    participantIds: string[];
    participantNames: Record<string, string>;
    title?: string;
    isSupportChat?: boolean;
    agent?: AgentProperties;
}

export async function createConversationApi(data: CreateConversationData): Promise<RawChatSession> {
    return authenticatedFetch('/api/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function initiateSupportChat(): Promise<RawChatSession> {
    return authenticatedFetch('/api/support-chat/initiate', {
        method: 'POST',
    });
}

export async function deleteConversationApi(chatId: string): Promise<{ message: string }> {
     return authenticatedFetch(`/api/conversations/${chatId}`, {
         method: 'DELETE',
     });
}

interface AgentChatApiVariables {
    agentId: string;
    message: string;
    conversationId: string;
}

export async function agentChatApi(variables: Omit<AgentChatApiVariables, 'token'>) {
    return authenticatedFetch('/api/agent-chat', {
        method: 'POST',
        body: JSON.stringify(variables),
    });
}
