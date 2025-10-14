/**
 * خدمات المحادثة المبسطة
 *
 * نظام مبسط لإدارة المحادثات والدردشة
 */

import type { AgentProperties } from '@/lib/models/agent';
import type { RawChatSession } from '@/lib/models/chat';
import { api } from './simple-service';

// أنواع البيانات
export interface CreateConversationData {
  participantIds: string[];
  participantNames: Record<string, string>;
  title?: string;
  isSupportChat?: boolean;
  agent?: AgentProperties;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: any;
}

export interface AgentChatData {
  agentId: string;
  message: string;
  conversationId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  averageResponseTime: number;
}

// خدمات المحادثة المبسطة
export const chatService = {
  // === خدمات المحادثات ===

  // إنشاء محادثة جديدة
  async createConversation(data: CreateConversationData, token: string) {
    return api.post<RawChatSession>('/chat/conversations', data, { token });
  },

  // بدء محادثة دعم
  async initiateSupportChat(token: string) {
    return api.post<RawChatSession>('/chat/support', {}, { token });
  },

  // حذف محادثة
  async deleteConversation(chatId: string, token: string) {
    return api.delete<{ message: string }>(`/chat/conversations/${chatId}`, { token });
  },

  // الحصول على قائمة المحادثات
  async getConversations(token: string, params?: {
    limit?: number;
    lastVisibleId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.lastVisibleId) queryParams.append('lastVisibleId', params.lastVisibleId);

    const queryString = queryParams.toString();
    const path = queryString ? `/chat/conversations?${queryString}` : '/chat/conversations';

    return api.get<{ conversations: ChatSession[]; hasNextPage: boolean; lastVisibleId?: string | null }>(path, { token });
  },

  // الحصول على محادثة محددة
  async getConversation(chatId: string, token: string) {
    return api.get<ChatSession>(`/chat/conversations/${chatId}`, { token });
  },

  // تحديث عنوان المحادثة
  async updateConversationTitle(chatId: string, title: string, token: string) {
    return api.put<{ message: string }>(`/chat/conversations/${chatId}`, { title }, { token });
  },

  // === خدمات الرسائل ===

  // إرسال رسالة
  async sendMessage(chatId: string, data: {
    content: string;
    type?: 'text' | 'image' | 'file';
    metadata?: any;
  }, token: string) {
    return api.post<ChatMessage>(`/chat/conversations/${chatId}/messages`, data, { token });
  },

  // الحصول على رسائل المحادثة
  async getMessages(chatId: string, token: string, params?: {
    limit?: number;
    lastVisibleId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.lastVisibleId) queryParams.append('lastVisibleId', params.lastVisibleId);

    const queryString = queryParams.toString();
    const path = queryString ? `/chat/conversations/${chatId}/messages?${queryString}` : `/chat/conversations/${chatId}/messages`;

    return api.get<{ messages: ChatMessage[]; hasNextPage: boolean; lastVisibleId?: string | null }>(path, { token });
  },

  // حذف رسالة
  async deleteMessage(chatId: string, messageId: string, token: string) {
    return api.delete<{ message: string }>(`/chat/conversations/${chatId}/messages/${messageId}`, { token });
  },

  // تحديث رسالة
  async updateMessage(chatId: string, messageId: string, content: string, token: string) {
    return api.put<{ message: string }>(`/chat/conversations/${chatId}/messages/${messageId}`, { content }, { token });
  },

  // === خدمات الدردشة مع الوكيل ===

  // الدردشة مع الوكيل
  async chatWithAgent(data: AgentChatData, token: string) {
    return api.post<ChatMessage>('/chat/agent', data, { token });
  },

  // الحصول على تاريخ الدردشة مع الوكيل
  async getAgentChatHistory(agentId: string, token: string, params?: {
    limit?: number;
    lastVisibleId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.lastVisibleId) queryParams.append('lastVisibleId', params.lastVisibleId);

    const queryString = queryParams.toString();
    const path = queryString ? `/chat/agent/${agentId}/history?${queryString}` : `/chat/agent/${agentId}/history`;

    return api.get<{ messages: ChatMessage[]; hasNextPage: boolean; lastVisibleId?: string | null }>(path, { token });
  },

  // === خدمات الإحصائيات ===

  // الحصول على إحصائيات المحادثة
  async getChatStats(token: string) {
    return api.get<ChatStats>('/chat/stats', { token });
  },

  // الحصول على إحصائيات محادثة محددة
  async getConversationStats(chatId: string, token: string) {
    return api.get<{
      totalMessages: number;
      averageResponseTime: number;
      lastActivity: string;
      participants: number;
    }>(`/chat/conversations/${chatId}/stats`, { token });
  },

  // === خدمات البحث ===

  // البحث في المحادثات
  async searchConversations(query: string, token: string) {
    return api.get<ChatSession[]>(`/chat/search?q=${encodeURIComponent(query)}`, { token });
  },

  // البحث في الرسائل
  async searchMessages(query: string, token: string, params?: {
    chatId?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (params?.chatId) queryParams.append('chatId', params.chatId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const path = `/chat/search/messages?${queryString}`;

    return api.get<ChatMessage[]>(path, { token });
  },

  // === خدمات الإشعارات ===

  // تمييز المحادثة كمقروءة
  async markAsRead(chatId: string, token: string) {
    return api.post<{ message: string }>(`/chat/conversations/${chatId}/read`, {}, { token });
  },

  // الحصول على المحادثات غير المقروءة
  async getUnreadConversations(token: string) {
    return api.get<ChatSession[]>('/chat/unread', { token });
  },

  // إعدادات الإشعارات
  async updateNotificationSettings(settings: {
    enableNotifications?: boolean;
    enableEmailNotifications?: boolean;
    enablePushNotifications?: boolean;
    quietHours?: { start: string; end: string };
  }, token: string) {
    return api.put<{ message: string }>('/chat/notifications/settings', settings, { token });
  },

  // الحصول على إعدادات الإشعارات
  async getNotificationSettings(token: string) {
    return api.get<any>('/chat/notifications/settings', { token });
  },
};

// دوال مساعدة للمحادثة
export const chatUtils = {
  // إنشاء محادثة مع معالجة الأخطاء
  async createConversationWithErrorHandling(data: CreateConversationData, token: string) {
    try {
      const result = await chatService.createConversation(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create conversation'
      };
    }
  },

  // بدء محادثة دعم مع معالجة الأخطاء
  async initiateSupportChatWithErrorHandling(token: string) {
    try {
      const result = await chatService.initiateSupportChat(token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate support chat'
      };
    }
  },

  // حذف محادثة مع معالجة الأخطاء
  async deleteConversationWithErrorHandling(chatId: string, token: string) {
    try {
      const result = await chatService.deleteConversation(chatId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Conversation deleted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete conversation'
      };
    }
  },

  // إرسال رسالة مع معالجة الأخطاء
  async sendMessageWithErrorHandling(chatId: string, data: {
    content: string;
    type?: 'text' | 'image' | 'file';
    metadata?: any;
  }, token: string) {
    try {
      const result = await chatService.sendMessage(chatId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  },

  // الدردشة مع الوكيل مع معالجة الأخطاء
  async chatWithAgentWithErrorHandling(data: AgentChatData, token: string) {
    try {
      const result = await chatService.chatWithAgent(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to chat with agent'
      };
    }
  },

  // الحصول على إحصائيات المحادثة مع معالجة الأخطاء
  async getChatStatsWithErrorHandling(token: string) {
    try {
      const result = await chatService.getChatStats(token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get chat stats'
      };
    }
  },

  // البحث في المحادثات مع معالجة الأخطاء
  async searchConversationsWithErrorHandling(query: string, token: string) {
    try {
      const result = await chatService.searchConversations(query, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search conversations'
      };
    }
  },

  // البحث في الرسائل مع معالجة الأخطاء
  async searchMessagesWithErrorHandling(query: string, token: string, params?: {
    chatId?: string;
    limit?: number;
  }) {
    try {
      const result = await chatService.searchMessages(query, token, params);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search messages'
      };
    }
  },

  // تحديث إعدادات الإشعارات مع معالجة الأخطاء
  async updateNotificationSettingsWithErrorHandling(settings: {
    enableNotifications?: boolean;
    enableEmailNotifications?: boolean;
    enablePushNotifications?: boolean;
    quietHours?: { start: string; end: string };
  }, token: string) {
    try {
      const result = await chatService.updateNotificationSettings(settings, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Notification settings updated successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification settings'
      };
    }
  },

  // === دوال مساعدة إضافية ===

  // تنسيق الوقت للعرض
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) { // أقل من دقيقة
      return 'الآن';
    } else if (diff < 3600000) { // أقل من ساعة
      const minutes = Math.floor(diff / 60000);
      return `منذ ${minutes} دقيقة`;
    } else if (diff < 86400000) { // أقل من يوم
      const hours = Math.floor(diff / 3600000);
      return `منذ ${hours} ساعة`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  },

  // تقصير النص للعرض
  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // التحقق من صحة رسالة
  validateMessage(content: string): { valid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: 'Message content is required' };
    }

    if (content.length > 4000) {
      return { valid: false, error: 'Message is too long (max 4000 characters)' };
    }

    return { valid: true };
  },

  // إنشاء عنوان محادثة تلقائي
  generateConversationTitle(participants: string[]): string {
    if (participants.length === 2) {
      return `محادثة بين ${participants[0]} و ${participants[1]}`;
    } else if (participants.length > 2) {
      return `محادثة جماعية (${participants.length} مشارك)`;
    } else {
      return 'محادثة جديدة';
    }
  },
};
