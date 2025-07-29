
'use server';

import { NextRequest } from 'next/server';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { z } from 'zod';
import { getUserProfile } from '@/lib/db/queries';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(2, "At least two participants are required."),
  title: z.string().optional(),
  participantNames: z.record(z.string()),
  isSupportChat: z.boolean().optional(),
  agent: z.any().optional(), // Allow agent data
});

function generateConversationId(participantIds: string[]): string {
    // Sort to ensure consistency regardless of order
    return participantIds.sort().join('-');
}

export const GET = withAuth(async ({ user }) => {
    try {
        const db = adminRealtimeDb;

        let conversations;
        if (user.role === 'admin') {
            // Admin fetches all conversations
            const convosRef = db.ref('conversations');
            const snapshot = await convosRef.orderByChild('lastMessageTimestamp').get();
            conversations = snapshot.val() || {};
        } else {
            // User fetches their own conversations
            const userConvoRef = db.ref(`userConversations/${user.id}`);
            const userConvoSnapshot = await userConvoRef.get();
            const conversationIds = userConvoSnapshot.val() ? Object.keys(userConvoSnapshot.val()) : [];
            
            if (conversationIds.length === 0) {
                 return createApiResponse([], 200);
            }

            const convoPromises = conversationIds.map(id => db.ref(`conversations/${id}`).get());
            const convoSnapshots = await Promise.all(convoPromises);
            conversations = convoSnapshots.reduce((acc, snap) => {
                if (snap.exists()) {
                    acc[snap.key!] = snap.val();
                }
                return acc;
            }, {} as Record<string, any>);
        }

        const conversationsArray = Object.values(conversations).sort((a, b) => 
            new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
        );
        return createApiResponse(conversationsArray, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = createConversationSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { participantIds, title, participantNames, isSupportChat, agent } = validation.data;
        
        // Ensure the creator is part of the conversation
        if (!participantIds.includes(user.id)) {
            return handleApiError({ message: 'Forbidden' }, 403);
        }

        const conversationId = generateConversationId(participantIds);
        const db = adminRealtimeDb;
        
        const conversationRef = db.ref(`conversations/${conversationId}`);
        const snapshot = await conversationRef.get();

        if (snapshot.exists()) {
             return createApiResponse(snapshot.val(), 200);
        }
        
        const now = new Date().toISOString();
        const newConversation = {
            id: conversationId,
            participantIds,
            createdAt: now,
            lastMessage: "Conversation started.",
            lastMessageTimestamp: now,
            title: title || 'New Chat',
            participantNames,
            isSupportChat: isSupportChat || false,
            agent: agent || null,
        };

        const updates: { [key: string]: any } = {};
        updates[`/conversations/${conversationId}`] = newConversation;
        participantIds.forEach(id => {
            updates[`/userConversations/${id}/${conversationId}`] = true;
        });

        await db.ref().update(updates);
        
        return createApiResponse(newConversation, 201);

    } catch (error) {
        return handleApiError(error);
    }
});
