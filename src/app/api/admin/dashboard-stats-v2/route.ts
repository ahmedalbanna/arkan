/**
 * API Route لإحصائيات لوحة التحكم - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإحصائيات لوحة التحكم
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج إحصائيات لوحة التحكم
 */
class DashboardStatsHandler extends SimpleApiHandler<{
    totalUsers: number;
    totalGenerations: number;
    pendingPayments: number;
    agentUsageChartData: Array<{
        name: string;
        agentId: string;
        count: number;
    }>;
    recentActivity: Array<{
        id: string;
        userName: string;
        [key: string]: any;
    }>;
}> {
    protected async processRequest(context: any) {
        const [summaryCounts, agentUsageChartData, recentActivity] = await Promise.all([
            this.getSummaryCounts(),
            this.getAgentUsage(),
            this.getRecentActivity(),
        ]);

        return {
            ...summaryCounts,
            agentUsageChartData,
            recentActivity
        };
    }

    private async getSummaryCounts() {
        const [usersSnapshot, generationsSnapshot, pendingTransactionsSnapshot] = await Promise.all([
            adminDb.collection('users').count().get(),
            adminDb.collection('agent_generations').count().get(),
            adminDb.collection('transactions').where('status', '==', 'pending').count().get()
        ]);

        return {
            totalUsers: usersSnapshot.data().count,
            totalGenerations: generationsSnapshot.data().count,
            pendingPayments: pendingTransactionsSnapshot.data().count,
        };
    }

    private async getAgentUsage() {
        // جلب سجلات آخر 30 يوم لإحصائيات استخدام الوكلاء لتحسين الأداء
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const agentGenerations = await adminDb.collection('agent_generations')
            .where('createdAt', '>=', thirtyDaysAgo.toISOString())
            .get();

        const agentUsage: Record<string, number> = {};
        agentGenerations.forEach(doc => {
            const agentId = doc.data().agentId;
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
        });

        const agentUsagePromises = Object.entries(agentUsage)
            .map(async ([agentId, count]) => ({
                name: await adminDb.collection('agents').doc(agentId).get().then(doc => doc.data()?.name || 'Unknown'),
                agentId,
                count,
            }));

        return (await Promise.all(agentUsagePromises))
            .sort((a, b) => b.count - a.count) // ترتيب بعد حل جميع الوعود
            .slice(0, 10); // الحصول على أفضل 10 وكلاء مستخدمين
    }

    private async getRecentActivity() {
        const recentGenerationsSnapshot = await adminDb.collection('agent_generations')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const activityPromises = recentGenerationsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userProfile = await getUserProfile(data.userId);
            return {
                id: doc.id,
                userName: userProfile?.name || 'Unknown User', // جلب اسم المستخدم
                ...data
            };
        });

        return Promise.all(activityPromises);
    }
}

// إنشاء المعالج
const dashboardStatsHandler = new DashboardStatsHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    dashboardStatsHandler.handle.bind(dashboardStatsHandler),
    {
        requireAdmin: true,
        logging: true
    }
);
