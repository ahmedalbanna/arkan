/**
 * API Route لسجل التوليدات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لاستعلام السجلات
const getLogsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(15),
    agentId: z.string().optional(),
    userId: z.string().optional(),
    lastVisibleId: z.string().optional(),
});

export const GET = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const queryValidation = getLogsQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return ApiResponse.badRequest(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { limit, agentId, userId, lastVisibleId } = queryValidation.data;

        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('agent_generations');

        if (agentId) {
            query = query.where('agentId', '==', agentId);
        }
        if (userId) {
            query = query.where('userId', '==', userId);
        }

        query = query.orderBy('createdAt', 'desc');

        if (lastVisibleId) {
            const lastDoc = await adminDb.collection('agent_generations').doc(lastVisibleId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.limit(limit + 1).get(); // Fetch one extra to check for next page

        const logsPromises = snapshot.docs.slice(0, limit).map(async (doc) => {
            const data = doc.data();
            const userProfile = await getUserProfile(data.userId);
            return {
                id: doc.id,
                userName: userProfile?.name || 'Unknown User', // Add user's name
                ...data
            };
        });

        const logs = await Promise.all(logsPromises);
        const hasNextPage = snapshot.docs.length > limit;

        return ApiResponse.success({
            logs,
            hasNextPage,
            lastVisibleId: hasNextPage && logs.length > 0 ? logs[logs.length - 1].id : null,
        });
    } catch (error) {
        console.error('Error fetching generations log:', error);
        return ApiResponse.error('Failed to fetch generations log', 500);
    }
}, { requireAdmin: true });
