/**
 * API Route لمحادثة الوكلاء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لمحادثة الوكلاء
 */

import { agentChat } from '@/ai/flows/agent-chat';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { getFirebaseClientDb } from '@/lib/core/api';
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

/**
 * معالج محادثة الوكلاء
 */
class AgentChatHandler extends CreditBasedApiHandler<{
    agentId: string;
    message: string;
    conversationId: string;
}, {
    response: string;
}> {
    protected inputSchema = chatSchema;
    protected creditCost = 1; // سيتم تحديده ديناميكياً

    protected async processRequest(data: any, context: any) {
        const { agentId, message, conversationId } = data;
        const { user } = context;
        const isAgentChat = agentId !== 'user-chat';

        const db = getFirebaseClientDb();
        const messagesRef = ref(db, `messages/${conversationId}`);

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
            this.creditCost = creditCost;

            const agentInput = { agentId, message };
            result = await agentChat(agentInput);

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
        } else {
            // للمحادثات العادية، لا توجد تكلفة ائتمانات
            this.creditCost = 0;
        }

        // تحديث آخر رسالة في المحادثة للترتيب
        const conversationRef = ref(db, `conversations/${conversationId}`);
        const lastMessage = isAgentChat ? result.response : message;

        if (lastMessage) {
            await update(conversationRef, {
                lastMessage: lastMessage,
                lastMessageTimestamp: new Date().toISOString()
            });
        }

        return result;
    }
}

// إنشاء المعالج
const agentChatHandler = new AgentChatHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    agentChatHandler.handle.bind(agentChatHandler),
    {
        logging: true
    }
);
