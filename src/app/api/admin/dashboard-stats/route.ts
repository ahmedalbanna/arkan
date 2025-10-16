// src/app/api/admin/dashboard-stats/route.ts

import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';

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
    // Fetch logs from the last 30 days for agent usage stats to improve performance
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
        .sort((a, b) => b.count - a.count) // Sort after all promises are resolved
        .slice(0, 10); // Get top 10 most used agents

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
            userName: userProfile?.name || 'Unknown User', // Fetch user name
            ...data
        };
    });

    return Promise.all(activityPromises);
}


export const GET = withAuth(async () => {
    try {
        const [summaryCounts, agentUsageChartData, recentActivity] = await Promise.all([
            getSummaryCounts(),
            getAgentUsage(),
            getRecentActivity(),
        ]);

        const stats = {
            ...summaryCounts,
            agentUsageChartData,
            recentActivity
        };

        return createApiResponse(stats, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
