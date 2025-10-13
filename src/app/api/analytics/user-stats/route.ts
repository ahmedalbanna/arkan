/**
 * API Route لإحصائيات المستخدم - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإحصائيات المستخدم
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج إحصائيات المستخدم
 */
class UserStatsHandler extends SimpleApiHandler<{
    totalGenerations: number;
    creditsUsed: number;
    agentUsageChartData: Array<{
        name: string;
        agentId: string;
        count: number;
    }>;
    recentActivity: Array<{
        id: string;
        [key: string]: any;
    }>;
}> {
    protected async processRequest(context: any) {
        const { user } = context;

        const userProfile = await getUserProfile(user.id);
        if (!userProfile) {
            throw new Error('User profile not found.');
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

        return {
            totalGenerations,
            creditsUsed,
            agentUsageChartData,
            recentActivity,
        };
    }
}

// إنشاء المعالج
const userStatsHandler = new UserStatsHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    userStatsHandler,
    {
        logging: true
    }
);
