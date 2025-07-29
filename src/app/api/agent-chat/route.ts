
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { agentChat } from '@/ai/flows/agent-chat';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { serverTimestamp } from 'firebase/database';

const chatSchema = z.object({
  agentId: z.string(),
  message: z.string(),
  conversationId: z.string(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = chatSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);

    const { agentId, message, conversationId } = validation.data;
    const agentInput = { agentId, message };
    const result = await agentChat(agentInput);

    // --- Save messages to Realtime Database ---
    const db = adminRealtimeDb;
    const messagesRef = db.ref(`messages/${conversationId}`);
    
    // User message
    const userMessage = {
        senderId: user.id,
        content: message,
        role: 'user',
        timestamp: serverTimestamp(),
    };
    await push(messagesRef, userMessage);

    // AI message
    const aiMessage = {
        senderId: agentId,
        content: result.response,
        role: 'assistant',
        timestamp: serverTimestamp(),
    };
    await push(messagesRef, aiMessage);
    
    // Update last message in conversation
    const conversationRef = db.ref(`conversations/${conversationId}`);
    await conversationRef.update({
        lastMessage: result.response,
        lastMessageTimestamp: new Date().toISOString()
    });
    // --- End DB saving ---

    await logGeneration({
      agentId: agentId,
      userId: user.id,
      input: { message: message },
      output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
