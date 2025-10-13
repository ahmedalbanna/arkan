/**
 * API Route لبدء الدعم الفني - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لبدء الدعم الفني
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';

/**
 * معالج بدء الدعم الفني
 */
class InitiateSupportChatHandler extends SimpleApiHandler<{
    id: string;
    participantIds: string[];
    createdAt: string;
    lastMessage: string;
    lastMessageTimestamp: string;
    title: string;
    participantNames: Record<string, string>;
    isSupportChat: boolean;
}> {
    protected async processRequest(context: any) {
        const { user } = context;

        // البحث عن جميع المدراء
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.empty) {
            throw new Error('No support admins available.');
        }

        const adminIds = adminsSnapshot.docs.map(doc => doc.id);
        const adminNames = adminsSnapshot.docs.reduce((acc, doc) => ({
            ...acc,
            [doc.id]: doc.data().name
        }), {});

        const participantIds = [user.id, ...adminIds];
        const participantNames = {
            [user.id]: user.name,
            ...adminNames
        };

        const newConversationRef = adminRealtimeDb.ref('conversations').push();
        const conversationId = newConversationRef.key;

        if (!conversationId) {
            throw new Error("Failed to generate a unique conversation ID.");
        }

        const now = new Date().toISOString();
        const newConversation = {
            id: conversationId,
            participantIds,
            createdAt: now,
            lastMessage: "Support chat initiated.",
            lastMessageTimestamp: now,
            title: `Support: ${user.name}`,
            participantNames,
            isSupportChat: true,
        };

        const updates: { [key: string]: any } = {};
        updates[`/conversations/${conversationId}`] = newConversation;
        participantIds.forEach(id => {
            updates[`/userConversations/${id}/${conversationId}`] = true;
        });

        await adminRealtimeDb.ref().update(updates);

        return newConversation;
    }
}

// إنشاء المعالج
const initiateSupportChatHandler = new InitiateSupportChatHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    initiateSupportChatHandler,
    {
        logging: true
    }
);
