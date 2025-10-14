/**
 * API Route للمحادثات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

export const GET = createApiHandler(async (context) => {
    try {
        const { user } = context;

        const userConversationsRef = adminRealtimeDb.ref(`userConversations/${user.id}`);
        const snapshot = await userConversationsRef.get();

        if (!snapshot.exists()) {
            return ApiResponse.success([]);
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
        return ApiResponse.success(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return ApiResponse.error('Failed to fetch conversations', 500);
    }
}, { requireAuth: true });

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { participantIds, participantNames, title, isSupportChat, agent } = await request.json();

        const newConversationRef = adminRealtimeDb.ref('conversations').push();
        const conversationId = newConversationRef.key;

        if (!conversationId) {
            return ApiResponse.error("Failed to generate a unique conversation ID.", 500);
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

        return ApiResponse.created(conversationData);
    } catch (error) {
        console.error('Error creating conversation:', error);
        return ApiResponse.error('Failed to create conversation', 500);
    }
}, { validateBody: createConversationSchema, requireAuth: true });
