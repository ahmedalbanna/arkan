
// src/app/api/admin/dashboard-stats/route.ts
import { AGENTS } from '@/lib/agents';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = withAuth(async () => {
    try {
        // Fetch all stats in parallel for efficiency
        const [
            usersSnapshot,
            generationsSnapshot,
            pendingTransactionsSnapshot,
            recentGenerationsSnapshot
        ] = await Promise.all([
            adminDb.collection('users').count().get(),
            adminDb.collection('agent_generations').count().get(),
            adminDb.collection('transactions').where('status', '==', 'pending').count().get(),
            adminDb.collection('agent_generations').orderBy('createdAt', 'desc').limit(5).get()
        ]);
        
        const totalUsers = usersSnapshot.data().count;
        const totalGenerations = generationsSnapshot.data().count;
        const pendingPayments = pendingTransactionsSnapshot.data().count;

        // Aggregate agent usage
        const agentGenerations = await adminDb.collection('agent_generations').get();
        const agentUsage: Record<string, number> = {};
        agentGenerations.forEach(doc => {
            const agentId = doc.data().agentId;
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
        });

        const agentUsageChartData = Object.entries(agentUsage)
            .map(([agentId, count]) => ({
                name: AGENTS.find(a => a.id === agentId)?.name || agentId,
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Get top 10 most used agents

        const recentActivity = recentGenerationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const stats = {
            totalUsers,
            totalGenerations,
            pendingPayments,
            agentUsageChartData,
            recentActivity
        };

        return createApiResponse(stats, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
