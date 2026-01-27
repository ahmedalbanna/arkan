// src/app/api/admin/dashboard-stats/route.ts

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { listDocs, getAgentHelper } from '@/lib/firebase/db-helpers';
import { getUserProfile } from '@/services/userService';

async function getSummaryCounts() {
    const [users, transactions, agentGenerations] = await Promise.all([
        listDocs('users'),
        listDocs('transactions', {
            filters: [{ field: 'status', operator: '==', value: 'pending' }],
        }),
        listDocs('agent_generations'),
    ]);

    return {
        totalUsers: users.length,
        totalGenerations: agentGenerations.length,
        pendingPayments: transactions.length,
    };
}

async function getAgentUsage() {
    // Fetch logs from the last 30 days for agent usage stats to improve performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const agentGenerations = await listDocs('agent_generations', {
        filters: [{ field: 'createdAt', operator: '>=', value: thirtyDaysAgo.toISOString() }],
    });

    const agentUsage: Record<string, number> = {};
    agentGenerations.forEach(doc => {
        const agentId = (doc as any).agentId;
        agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
    });

    const agentUsagePromises = Object.entries(agentUsage)
        .map(async ([agentId, count]) => {
            const agent = await getAgentHelper(agentId);
            return {
                name: agent?.name || 'Unknown',
                agentId,
                count,
            };
        });
    
    return (await Promise.all(agentUsagePromises))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Get top 10 most used agents
}

async function getRecentActivity() {
    const recentGenerations = await listDocs('agent_generations', {
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: 5,
    });

    const activityPromises = recentGenerations.map(async (doc) => {
        const userProfile = await getUserProfile((doc as any).userId);
        return {
            ...doc,
            userName: userProfile?.name || 'Unknown User',
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
            recentActivity,
        };

        return createApiResponse(stats, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
