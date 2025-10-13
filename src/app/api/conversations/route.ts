/**
 * API Route للمحادثات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للمحادثات
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb, adminRealtimeDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لإنشاء محادثة جديدة
const createConversationSchema = z.object({
    participantIds: z.array(z.string()).min(2, "At least two participants are required."),
    participantNames: z.record(z.string()),
    title: z.string().optional(),
    isSupportChat: z.boolean().optional(),
    agent: z.object({
        id: z.string(),
        name: z.string()
    }).optional(), // معلومات الوكيل للمحادثات مع الوكلاء
});

/**
 * معالج قائمة المحادثات (GET)
 */
class ConversationsListHandler extends SimpleApiHandler<Array<{
    id: string;
    [key: string]: any;
}>> {
    protected async processRequest(context: any) {
        const { user } = context;

        const userConversationsRef = adminRealtimeDb.ref(`userConversations/${user.id}`);
        const snapshot = await userConversationsRef.get();

        if (!snapshot.exists()) {
            return [];
        }

        const conversationIds = Object.keys(snapshot.val());

        const conversationPromises = conversationIds.map(async (id) => {
            const convoRef = adminRealtimeDb.ref(`conversations/${id}`);
            const convoSnapshot = await convoRef.get();
            if (!convoSnapshot.exists()) return null;

            const convoData = convoSnapshot.val();

            // إذا كانت محادثة مع وكيل، جلب بيانات الوكيل من الإعدادات الثابتة
            if (convoData.agent && convoData.agent.id) {
                const agentDoc = await adminDb.collection('agents').doc(convoData.agent.id).get();
                if (agentDoc.exists) {
                    const defaultAgent = agentDoc.data() as { icon: string };
                    convoData.agent.icon = defaultAgent.icon;
                }
            }

            return { id, ...convoData };
        });

        const conversations = (await Promise.all(conversationPromises)).filter(c => c !== null);
        return conversations;
    }
}

/**
 * معالج إنشاء محادثة جديدة (POST)
 */
class CreateConversationHandler extends ComplexApiHandler<{
    participantIds: string[];
    participantNames: Record<string, string>;
    title?: string;
    isSupportChat?: boolean;
    agent?: { id: string; name: string };
}, {
    id: string;
    participantIds: string[];
    participantNames: Record<string, string>;
    createdAt: string;
    lastMessage: string;
    lastMessageTimestamp: string;
    title: string;
    isSupportChat: boolean;
    agent: any;
}> {
    protected inputSchema = createConversationSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { participantIds, participantNames, title, isSupportChat, agent } = data;
        const { user } = context;

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
        participantIds.forEach((id: string) => {
            updates[`/userConversations/${id}/${conversationId}`] = true;
        });

        await adminRealtimeDb.ref().update(updates);

        return conversationData;
    }
}

// إنشاء المعالجات
const conversationsListHandler = new ConversationsListHandler();
const createConversationHandler = new CreateConversationHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    conversationsListHandler,
    {
        logging: true
    }
);

export const POST = withApiMiddleware(
    createConversationHandler,
    {
        logging: true
    }
);
