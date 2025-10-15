/**
 * خدمة المحادثة - Services v2.0
 *
 * خدمة محسنة للمحادثة والدردشة مع الوكلاء مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface RawChatSession {
    id: string;
    title: string;
    participants: Array<{
        id: string;
        name: string;
        role: 'user' | 'agent' | 'system';
    }>;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    type: 'user_agent' | 'support' | 'group';
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'agent' | 'system';
    content: string;
    timestamp: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    metadata?: {
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        imageUrl?: string;
        tokensUsed?: number;
        processingTime?: number;
    };
}

export interface AgentProperties {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
    tools?: string[];
    isActive: boolean;
}

export interface CreateConversationData {
    participantIds: string[];
    participantNames: Record<string, string>;
    title?: string;
    isSupportChat?: boolean;
    agent?: AgentProperties;
}

export class ChatServiceV2 extends BaseService {
    constructor() {
        super('ChatServiceV2');
    }

    /**
     * إنشاء محادثة جديدة مع مراقبة الأداء
     */
    async createConversation(data: CreateConversationData, token: string): Promise<RawChatSession> {
        const operationId = this.startOperation('createConversation');

        try {
            if (!token) {
                throw new Error("User not authenticated");
            }

            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create conversation');
            }

            const conversation = await response.json();
            this.endOperation(operationId, { success: true });
            return conversation;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.createConversation');
            throw error;
        }
    }

    /**
     * بدء محادثة دعم فني مع مراقبة شاملة
     */
    async initiateSupportChat(token: string): Promise<RawChatSession> {
        const operationId = this.startOperation('initiateSupportChat');

        try {
            if (!token) {
                throw new Error("User not authenticated");
            }

            const response = await fetch('/api/support-chat/initiate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to initiate support chat');
            }

            const conversation = await response.json();
            this.endOperation(operationId, { success: true });
            return conversation;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.initiateSupportChat');
            throw error;
        }
    }

    /**
     * جلب محادثات المستخدم مع مراقبة الأداء
     */
    async getUserConversations(token: string): Promise<RawChatSession[]> {
        const operationId = this.startOperation('getUserConversations');

        try {
            const response = await fetch('/api/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user conversations');
            }

            const conversations = await response.json();
            this.endOperation(operationId, { success: true, conversationCount: conversations.length });
            return conversations;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.getUserConversations');
            throw error;
        }
    }

    /**
     * جلب محادثة محددة مع مراقبة شاملة
     */
    async getConversation(conversationId: string, token: string): Promise<RawChatSession | null> {
        const operationId = this.startOperation('getConversation');

        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    this.endOperation(operationId, { success: true, result: 'not-found' });
                    return null;
                }
                throw new Error('Failed to fetch conversation');
            }

            const conversation = await response.json();
            this.endOperation(operationId, { success: true });
            return conversation;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.getConversation');
            throw error;
        }
    }

    /**
     * إرسال رسالة في محادثة مع مراقبة الأداء
     */
    async sendMessage(
        conversationId: string,
        content: string,
        messageType: 'text' | 'image' | 'file' = 'text',
        metadata?: any,
        token?: string
    ): Promise<ChatMessage> {
        const operationId = this.startOperation('sendMessage');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    content,
                    messageType,
                    metadata
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send message');
            }

            const message = await response.json();
            this.endOperation(operationId, { success: true, messageType });
            return message;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.sendMessage');
            throw error;
        }
    }

    /**
     * جلب رسائل محادثة مع مراقبة شاملة
     */
    async getConversationMessages(
        conversationId: string,
        token: string,
        limit: number = 50,
        before?: string
    ): Promise<{
        messages: ChatMessage[];
        hasMore: boolean;
        nextCursor?: string;
    }> {
        const operationId = this.startOperation('getConversationMessages');

        try {
            const queryParams = new URLSearchParams({
                limit: limit.toString()
            });

            if (before) {
                queryParams.append('before', before);
            }

            const response = await fetch(`/api/conversations/${conversationId}/messages?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch conversation messages');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, messageCount: result.messages?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.getConversationMessages');
            throw error;
        }
    }

    /**
     * حذف رسالة مع مراقبة الأداء
     */
    async deleteMessage(conversationId: string, messageId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteMessage');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete message');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.deleteMessage');
            throw error;
        }
    }

    /**
     * تحديث رسالة مع مراقبة شاملة
     */
    async updateMessage(
        conversationId: string,
        messageId: string,
        content: string,
        token: string
    ): Promise<ChatMessage> {
        const operationId = this.startOperation('updateMessage');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update message');
            }

            const message = await response.json();
            this.endOperation(operationId, { success: true });
            return message;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.updateMessage');
            throw error;
        }
    }

    /**
     * حذف محادثة مع مراقبة الأداء
     */
    async deleteConversation(conversationId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteConversation');

        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete conversation');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.deleteConversation');
            throw error;
        }
    }

    /**
     * محادثة مع وكيل ذكي مع مراقبة شاملة
     */
    async agentChat(
        conversationId: string,
        message: string,
        agentId: string,
        token?: string
    ): Promise<{
        response: string;
        agentResponse: ChatMessage;
        usage: {
            tokensUsed: number;
            processingTime: number;
        };
    }> {
        const operationId = this.startOperation('agentChat');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/agent-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    message,
                    agentId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to chat with agent');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, tokensUsed: result.usage?.tokensUsed || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.agentChat');
            throw error;
        }
    }

    /**
     * جلب محادثات الدعم الفني مع مراقبة الأداء
     */
    async getSupportConversations(token: string): Promise<RawChatSession[]> {
        const operationId = this.startOperation('getSupportConversations');

        try {
            const response = await fetch('/api/support-chat/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch support conversations');
            }

            const conversations = await response.json();
            this.endOperation(operationId, { success: true, conversationCount: conversations.length });
            return conversations;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.getSupportConversations');
            throw error;
        }
    }

    /**
     * إغلاق محادثة دعم فني مع مراقبة شاملة
     */
    async closeSupportConversation(conversationId: string, rating?: number, feedback?: string, token?: string): Promise<void> {
        const operationId = this.startOperation('closeSupportConversation');

        try {
            const response = await fetch(`/api/support-chat/${conversationId}/close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    rating,
                    feedback
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to close support conversation');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.closeSupportConversation');
            throw error;
        }
    }

    /**
     * جلب إحصائيات المحادثات مع مراقبة الأداء
     */
    async getChatStats(token?: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalConversations: number;
        totalMessages: number;
        activeConversations: number;
        averageResponseTime: number;
        topAgents: Array<{
            agentId: string;
            agentName: string;
            conversationCount: number;
        }>;
        messageTrends: Array<{
            date: string;
            count: number;
        }>;
    }> {
        const operationId = this.startOperation('getChatStats');

        try {
            const response = await fetch(`/api/conversations/stats?range=${timeRange}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chat stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.getChatStats');
            throw error;
        }
    }

    /**
     * البحث في المحادثات مع مراقبة شاملة
     */
    async searchConversations(
        query: string,
        filters: {
            participantId?: string;
            type?: 'user_agent' | 'support' | 'group';
            hasUnread?: boolean;
            limit?: number;
            offset?: number;
        } = {},
        token: string
    ): Promise<{
        conversations: RawChatSession[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const operationId = this.startOperation('searchConversations');

        try {
            const queryParams = new URLSearchParams({ q: query });

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`/api/conversations/search?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to search conversations');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, resultCount: result.conversations?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.searchConversations');
            throw error;
        }
    }

    /**
     * حفظ محادثة كمفضلة مع مراقبة الأداء
     */
    async favoriteConversation(conversationId: string, token: string): Promise<{
        conversationId: string;
        favoritedAt: string;
    }> {
        const operationId = this.startOperation('favoriteConversation');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/favorite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to favorite conversation');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.favoriteConversation');
            throw error;
        }
    }

    /**
     * إلغاء حفظ محادثة من المفضلة مع مراقبة شاملة
     */
    async unfavoriteConversation(conversationId: string, token: string): Promise<void> {
        const operationId = this.startOperation('unfavoriteConversation');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/favorite`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to unfavorite conversation');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.unfavoriteConversation');
            throw error;
        }
    }

    /**
     * جلب المحادثات المفضلة مع مراقبة الأداء
     */
    async getFavoriteConversations(token: string): Promise<RawChatSession[]> {
        const operationId = this.startOperation('getFavoriteConversations');

        try {
            const response = await fetch('/api/conversations/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch favorite conversations');
            }

            const conversations = await response.json();
            this.endOperation(operationId, { success: true, conversationCount: conversations.length });
            return conversations;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.getFavoriteConversations');
            throw error;
        }
    }

    /**
     * تصدير محادثة مع مراقبة شاملة
     */
    async exportConversation(
        conversationId: string,
        format: 'json' | 'pdf' | 'txt',
        token: string
    ): Promise<{
        format: string;
        data: string;
        filename: string;
        size: number;
    }> {
        const operationId = this.startOperation('exportConversation');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ format })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to export conversation');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, format });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.exportConversation');
            throw error;
        }
    }

    /**
     * أرشفة محادثة مع مراقبة الأداء
     */
    async archiveConversation(conversationId: string, token: string): Promise<void> {
        const operationId = this.startOperation('archiveConversation');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/archive`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to archive conversation');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.archiveConversation');
            throw error;
        }
    }

    /**
     * إلغاء أرشفة محادثة مع مراقبة شاملة
     */
    async unarchiveConversation(conversationId: string, token: string): Promise<void> {
        const operationId = this.startOperation('unarchiveConversation');

        try {
            const response = await fetch(`/api/conversations/${conversationId}/archive`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to unarchive conversation');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.unarchiveConversation');
            throw error;
        }
    }

    /**
     * جلب المحادثات المؤرشفة مع مراقبة الأداء
     */
    async getArchivedConversations(token: string): Promise<RawChatSession[]> {
        const operationId = this.startOperation('getArchivedConversations');

        try {
            const response = await fetch('/api/conversations/archived', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch archived conversations');
            }

            const conversations = await response.json();
            this.endOperation(operationId, { success: true, conversationCount: conversations.length });
            return conversations;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ChatServiceV2.getArchivedConversations');
            throw error;
        }
    }
}