
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { agentChat } from '@/ai/flows/agent-chat';
import { withAuth, handleApiError, createApiResponse, getFirebaseClientDb } from '@/lib/api-utils';
import { push, serverTimestamp, update, ref } from 'firebase/database';

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

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = chatSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
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

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
