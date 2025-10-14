/**
 * API Route لإحصائيات لوحة التحكم - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
        const [summaryCounts, agentUsageChartData, recentActivity] = await Promise.all([
            getSummaryCounts(),
            getAgentUsage(),
            getRecentActivity(),
        ]);

        return ApiResponse.success({
            ...summaryCounts,
            agentUsageChartData,
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return ApiResponse.error('Failed to fetch dashboard stats', 500);
    }
}, { requireAdmin: true });

async function getSummaryCounts() {
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

async function getAgentUsage() {
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

async function getRecentActivity() {
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
