/**
 * API Route لحذف المحادثات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminRealtimeDb } from '@/lib/firebase/server-init';

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params, user } = context;
        const conversationId = params.id;

        if (!conversationId) {
            return ApiResponse.badRequest('Conversation ID is required.');
        }

        const convoRef = adminRealtimeDb.ref(`conversations/${conversationId}`);
        const convoSnapshot = await convoRef.get();

        if (!convoSnapshot.exists()) {
            return ApiResponse.notFound('Conversation not found.');
        }

        const conversation = convoSnapshot.val();

        // Authorization: Check if the user is a participant
        if (!conversation.participantIds.includes(user.id)) {
            return ApiResponse.forbidden('Access denied');
        }

        const updates: { [key: string]: null } = {};
        updates[`/conversations/${conversationId}`] = null;
        updates[`/messages/${conversationId}`] = null;
        conversation.participantIds.forEach((participantId: string) => {
            updates[`/userConversations/${participantId}/${conversationId}`] = null;
        });

        await adminRealtimeDb.ref().update(updates);

        return ApiResponse.success({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return ApiResponse.error('Failed to delete conversation', 500);
    }
}, { requireAuth: true });
