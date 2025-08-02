
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminRealtimeDb } from '@/lib/firebase/server-init';

export const DELETE = withAuth(async ({ user, params }) => {
    try {
        const conversationId = params.id;
        if (!conversationId) {
            return handleApiError({ message: 'Conversation ID is required.' }, 400);
        }

        const convoRef = adminRealtimeDb.ref(`conversations/${conversationId}`);
        const convoSnapshot = await convoRef.get();

        if (!convoSnapshot.exists()) {
             return handleApiError({ message: 'Conversation not found.' }, 404);
        }

        const conversation = convoSnapshot.val();
        
        // Authorization: Check if the user is a participant
        if (!conversation.participantIds.includes(user.id)) {
            return handleApiError({ message: 'Forbidden' }, 403);
        }
        
        const updates: { [key: string]: null } = {};
        updates[`/conversations/${conversationId}`] = null;
        updates[`/messages/${conversationId}`] = null;
        conversation.participantIds.forEach((participantId: string) => {
            updates[`/userConversations/${participantId}/${conversationId}`] = null;
        });
        
        await adminRealtimeDb.ref().update(updates);
        
        return createApiResponse({ message: 'Conversation deleted successfully' }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
