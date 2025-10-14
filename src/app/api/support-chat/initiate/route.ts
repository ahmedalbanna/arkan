/**
 * API Route لبدء محادثة الدعم - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';

export const POST = createApiHandler(async (context) => {
    try {
        const { user } = context;

        // جلب قائمة المدراء
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.empty) {
            return ApiResponse.error('No admins available for support', 503);
        }

        const adminIds = adminsSnapshot.docs.map(doc => doc.id);
        const participantIds = [user.id, ...adminIds];
        const participantNames: Record<string, string> = { [user.id]: user.name || 'User' };

        // إضافة أسماء المدراء
        adminsSnapshot.docs.forEach(doc => {
            const adminData = doc.data();
            participantNames[doc.id] = adminData.name || 'Admin';
        });

        const newConversationRef = adminRealtimeDb.ref('conversations').push();
        const conversationId = newConversationRef.key;

        if (!conversationId) {
            return ApiResponse.error("Failed to generate a unique conversation ID.", 500);
        }

        const now = new Date().toISOString();

        const conversationData = {
            id: conversationId,
            participantIds,
            participantNames,
            createdAt: now,
            lastMessage: "Support conversation started.",
            lastMessageTimestamp: now,
            title: `Support Chat - ${user.name || user.email}`,
            isSupportChat: true,
        };

        const updates: { [key: string]: any } = {};
        updates[`/conversations/${conversationId}`] = conversationData;
        participantIds.forEach((id: string) => {
            updates[`/userConversations/${id}/${conversationId}`] = true;
        });

        await adminRealtimeDb.ref().update(updates);

        return ApiResponse.created(conversationData);
    } catch (error) {
        console.error('Error initiating support chat:', error);
        return ApiResponse.error('Failed to initiate support chat', 500);
    }
}, { requireAuth: true });
