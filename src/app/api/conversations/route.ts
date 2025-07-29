
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { z } from 'zod';
import { AGENTS } from '@/lib/agents';

// GET handler
export const GET = withAuth(async ({ user }) => {
  try {
    const userConversationsRef = adminRealtimeDb.ref(`userConversations/${user.id}`);
    const snapshot = await userConversationsRef.get();

    if (!snapshot.exists()) {
      return createApiResponse([], 200);
    }

    const conversationIds = Object.keys(snapshot.val());
    
    const conversationPromises = conversationIds.map(async (id) => {
      const convoRef = adminRealtimeDb.ref(`conversations/${id}`);
      const convoSnapshot = await convoRef.get();
      if (!convoSnapshot.exists()) return null;
      
      const convoData = convoSnapshot.val();
      // If it's an agent chat, hydrate the agent data from the static config
      if (convoData.agent) {
          const defaultAgent = AGENTS.find(a => a.id === convoData.agent.id);
          if (defaultAgent) {
              convoData.agent.icon = defaultAgent.icon;
          }
      }
      return { id, ...convoData };
    });

    const conversations = (await Promise.all(conversationPromises)).filter(c => c !== null);

    return createApiResponse(conversations, 200);
  } catch (error) {
    return handleApiError(error);
  }
});


const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(2, "At least two participants are required."),
  participantNames: z.record(z.string()),
  title: z.string().optional(),
  isSupportChat: z.boolean().optional(),
  agent: z.object({ id: z.string(), name: z.string() }).optional(), // Agent info for agent chats
});


// POST handler
export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const { participantIds, participantNames, title, isSupportChat, agent } = validation.data;
    
    const newConversationRef = adminRealtimeDb.ref('conversations').push();
    const conversationId = newConversationRef.key;
    if (!conversationId) {
      throw new Error("Failed to generate a unique conversation ID.");
    }
    
    const now = new Date().toISOString();
    
    const conversationData = {
      id: conversationId,
      participantIds,
      participantNames,
      createdAt: now,
      lastMessage: "Conversation started.",
      lastMessageTimestamp: now,
      title: title || `Chat with ${Object.values(participantNames).filter(name => name !== user.name).join(', ')}`,
      isSupportChat: isSupportChat || false,
      agent: agent || null,
    };

    const updates: { [key: string]: any } = {};
    updates[`/conversations/${conversationId}`] = conversationData;
    participantIds.forEach(id => {
      updates[`/userConversations/${id}/${conversationId}`] = true;
    });

    await adminRealtimeDb.ref().update(updates);

    return createApiResponse(conversationData, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
