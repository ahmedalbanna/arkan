/**
 * API Route لإحصائيات المستخدم - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
        const { user } = context;

        const userProfile = await getUserProfile(user.id);
        if (!userProfile) {
            return ApiResponse.notFound('User profile not found');
        }

        const generationsSnapshot = await adminDb.collection('agent_generations')
            .where('userId', '==', user.id)
            .orderBy('createdAt', 'desc')
            .get();

        const totalGenerations = generationsSnapshot.size;

        const agentUsage: Record<string, number> = {};
        let creditsUsed = 0;
        generationsSnapshot.forEach(doc => {
            const data = doc.data();
            const agentId = data.agentId;
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
            creditsUsed += data.creditCost || 0;
        });

        const agentUsagePromises = Object.entries(agentUsage).map(async ([agentId, count]) => ({
            name: await adminDb.collection('agents').doc(agentId).get().then(doc => doc.data()?.name || 'Unknown'),
            agentId,
            count,
        }));

        const agentUsageChartData = (await Promise.all(agentUsagePromises))
            .sort((a, b) => b.count - a.count) // ترتيب بعد حل جميع الوعود
            .slice(0, 10);

        const recentActivity = generationsSnapshot.docs.slice(0, 5).map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const stats = {
            totalGenerations,
            creditsUsed,
            agentUsageChartData,
            recentActivity,
        };

        return ApiResponse.success(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return ApiResponse.error('Failed to fetch user stats', 500);
    }
}, { requireAuth: true });
