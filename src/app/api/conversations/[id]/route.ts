
'use server';

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
export const DELETE = withEnhancedAuth(async ({ user, params }) => {
    try {
        const conversationId = params.id;
        if (!conversationId) {
            return handleApiErrorEnhanced({ message: 'Conversation ID is required.' }, '400');
        }

        const convoRef = adminRealtimeDb.ref(`conversations/${conversationId}`);
        const convoSnapshot = await convoRef.get();

        if (!convoSnapshot.exists()) {
            return handleApiErrorEnhanced({ message: 'Conversation not found.' }, '404');
        }

        const conversation = convoSnapshot.val();

        // Authorization: Check if the user is a participant
        if (!conversation.participantIds.includes(user.id)) {
            return handleApiErrorEnhanced({ message: 'Forbidden' }, '403');
        }

        const updates: { [key: string]: null } = {};
        updates[`/conversations/${conversationId}`] = null;
        updates[`/messages/${conversationId}`] = null;
        conversation.participantIds.forEach((participantId: string) => {
            updates[`/userConversations/${participantId}/${conversationId}`] = null;
        });

        await adminRealtimeDb.ref().update(updates);

        return createApiResponseEnhanced({ message: 'Conversation deleted successfully' }, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});
