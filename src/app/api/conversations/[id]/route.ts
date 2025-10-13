/**
 * API Route لحذف المحادثات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لحذف المحادثات
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminRealtimeDb } from '@/lib/firebase/server-init';

/**
 * معالج حذف المحادثة
 */
class DeleteConversationHandler extends SimpleApiHandler<{ message: string }> {
    protected async processRequest(context: any) {
        const { params, user } = context;
        const conversationId = params.id;

        if (!conversationId) {
            throw new Error('Conversation ID is required.');
        }

        const convoRef = adminRealtimeDb.ref(`conversations/${conversationId}`);
        const convoSnapshot = await convoRef.get();

        if (!convoSnapshot.exists()) {
            throw new Error('Conversation not found.');
        }

        const conversation = convoSnapshot.val();

        // Authorization: Check if the user is a participant
        if (!conversation.participantIds.includes(user.id)) {
            throw new Error('Forbidden');
        }

        const updates: { [key: string]: null } = {};
        updates[`/conversations/${conversationId}`] = null;
        updates[`/messages/${conversationId}`] = null;
        conversation.participantIds.forEach((participantId: string) => {
            updates[`/userConversations/${participantId}/${conversationId}`] = null;
        });

        await adminRealtimeDb.ref().update(updates);

        return { message: 'Conversation deleted successfully' };
    }
}

// إنشاء المعالج
const deleteConversationHandler = new DeleteConversationHandler();

// تصدير الـ handler مع middleware
export const DELETE = withApiMiddleware(
    deleteConversationHandler,
    { logging: true }
);
