
'use server';

import { agentChat } from '@/ai/flows/agent-chat';
import { createApiResponseEnhanced, getFirebaseClientDb, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { push, ref, serverTimestamp, update } from 'firebase/database';
import { z } from 'zod';

const chatSchema = z.object({
  agentId: z.string(),
  message: z.string(),
  conversationId: z.string(),
});

// Define a type for the message payload to handle serverTimestamp
interface FirebaseMessage {
  senderId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: object; // serverTimestamp() returns an object
}

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = chatSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const { agentId, message, conversationId } = validation.data;
    const isAgentChat = agentId !== 'user-chat';

    const db = getFirebaseClientDb();
    const messagesRef = ref(db, `messages/${conversationId}`);

    // Always save the user's message first
    const userMessage: FirebaseMessage = {
      senderId: user.id,
      content: message,
      role: 'user' as const,
      timestamp: serverTimestamp(),
    };
    await push(messagesRef, userMessage);

    let result = { response: '' };
    let creditCost = 0;

    if (isAgentChat) {
      // If it's an agent chat, deduct credit and invoke the AI flow
      creditCost = 1;
      await deductCredit(user.id, creditCost);
      const agentInput = { agentId, message };
      result = await agentChat(agentInput);

      // Save the AI's response
      const aiMessage: FirebaseMessage = {
        senderId: agentId,
        content: result.response,
        role: 'assistant' as const,
        timestamp: serverTimestamp(),
      };
      await push(messagesRef, aiMessage);

      await logGeneration({
        agentId: agentId,
        userId: user.id,
        input: { message: message },
        output: result,
        creditCost: creditCost,
      });
    }

    // Update last message in conversation for sorting
    const conversationRef = ref(db, `conversations/${conversationId}`);
    const lastMessage = isAgentChat ? result.response : message;

    if (lastMessage) {
      await update(conversationRef, {
        lastMessage: lastMessage,
        lastMessageTimestamp: new Date().toISOString()
      });
    }

    return createApiResponseEnhanced(result, 200);

  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
