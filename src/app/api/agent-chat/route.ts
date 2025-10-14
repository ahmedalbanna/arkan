/**
 * API Route لمحادثة الوكلاء - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

// import { agentChat } from '@/ai/flows/agent-chat';
import { ApiResponse, createApiHandler } from '@/core/api';
import { RealtimeDatabase } from '@/lib/firebase/client-init';
import { logGeneration } from '@/services';
import { push, ref, serverTimestamp, update } from 'firebase/database';
import { z } from 'zod';

// Schema لمحادثة الوكلاء
const chatSchema = z.object({
    agentId: z.string(),
    message: z.string(),
    conversationId: z.string(),
});

// نوع رسالة Firebase للتعامل مع serverTimestamp
interface FirebaseMessage {
    senderId: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: object; // serverTimestamp() يعيد object
}

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { agentId, message, conversationId } = await request.json();

        const isAgentChat = agentId !== 'user-chat';

        // Using RealtimeDatabase from client-init
        const messagesRef = ref(RealtimeDatabase, `messages/${conversationId}`);

        // حفظ رسالة المستخدم أولاً دائماً
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
            // إذا كانت محادثة مع وكيل، خصم ائتمان واستدعاء AI flow
            creditCost = 1;

            const agentInput = { agentId, message };
            // result = await agentChat(agentInput);
            result = { response: "Agent chat functionality temporarily disabled" };

            // حفظ رد الـ AI
            const aiMessage: FirebaseMessage = {
                senderId: agentId,
                content: result.response,
                role: 'assistant' as const,
                timestamp: serverTimestamp(),
            };
            await push(messagesRef, aiMessage);

            // تسجيل العملية
            await logGeneration({
                agentId: agentId,
                userId: user.id,
                input: { message: message },
                output: result,
                creditCost: creditCost,
            });
        }

        // تحديث آخر رسالة في المحادثة للترتيب
        const conversationRef = ref(RealtimeDatabase, `conversations/${conversationId}`);
        const lastMessage = isAgentChat ? result.response : message;

        if (lastMessage) {
            await update(conversationRef, {
                lastMessage: lastMessage,
                lastMessageTimestamp: new Date().toISOString()
            });
        }

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Agent chat error:', error);
        return ApiResponse.error('Failed to process agent chat', 500);
    }
}, { validateBody: chatSchema, requireAuth: true });
