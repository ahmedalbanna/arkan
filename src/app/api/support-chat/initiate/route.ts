
'use server';

import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import { handleApiError, withAuth, createApiResponse } from '@/lib/api-utils';

export const POST = withAuth(async ({ user }) => {
  try {
    // Find all admins
    const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
    if (adminsSnapshot.empty) {
      return handleApiError({ message: 'No support admins available.' }, 503);
    }

    const adminIds = adminsSnapshot.docs.map(doc => doc.id);
    const adminNames = adminsSnapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data().name }), {});

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

    return createApiResponse(newConversation, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
