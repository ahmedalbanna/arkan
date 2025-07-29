
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

async function verifyAccess(requesterId: string, conversationId: string) {
    const convoSnapshot = await adminRealtimeDb.ref(`conversations/${conversationId}`).get();
    if (!convoSnapshot.exists()) {
        throw { status: 404, message: 'Conversation not found' };
    }
    const conversation = convoSnapshot.val();
    
    if (!conversation.participantIds.includes(requesterId)) {
        throw { status: 403, message: 'Forbidden' };
    }
    return conversation;
}

export const DELETE = withAuth(async ({ params, user }) => {
    try {
        const conversationId = params.id;
        const conversation = await verifyAccess(user.id, conversationId);

        const updates: { [key: string]: null } = {};
        updates[`/conversations/${conversationId}`] = null;
        updates[`/messages/${conversationId}`] = null;
        conversation.participantIds.forEach((id: string) => {
            updates[`/userConversations/${id}/${conversationId}`] = null;
        });

        await adminRealtimeDb.ref().update(updates);

        return createApiResponse({ message: 'Conversation deleted successfully.' }, 200);
    } catch (error: any) {
        // Special case: if convo is already gone, return success to client
        if (error?.status === 404) {
            return createApiResponse({ message: 'Conversation already deleted.' }, 200);
        }
        return handleApiError(error);
    }
});
