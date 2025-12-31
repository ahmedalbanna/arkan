// src/app/api/admin/dashboard-stats/route.ts

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/services/userService';

async function getSummaryCounts() {
    let [usersSnapshot, generationsSnapshot, pendingTransactionsSnapshot] = await Promise.all([
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
    let thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let agentGenerations = await adminDb.collection('agent_generations')
        .where('createdAt', '>=', thirtyDaysAgo.toISOString())
        .get();

    let agentUsage: Record<string, number> = {};
    agentGenerations.forEach(doc => {
        let agentId = doc.data().agentId;
        agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
    });

    let agentUsagePromises = Object.entries(agentUsage)
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
    let recentGenerationsSnapshot = await adminDb.collection('agent_generations')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

    let activityPromises = recentGenerationsSnapshot.docs.map(async (doc) => {
        let data = doc.data();
        let userProfile = await getUserProfile(data.userId);
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
        let [summaryCounts, agentUsageChartData, recentActivity] = await Promise.all([
            getSummaryCounts(),
            getAgentUsage(),
            getRecentActivity(),
        ]);

        let stats = {
            ...summaryCounts,
            agentUsageChartData,
            recentActivity
        };

        return createApiResponse(stats, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
