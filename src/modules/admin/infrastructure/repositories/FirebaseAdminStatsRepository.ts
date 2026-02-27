
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { IAdminStatsRepository, DashboardStats } from "../../domain/repositories/IAdminStatsRepository";

@injectable()
export class FirebaseAdminStatsRepository implements IAdminStatsRepository {
    async getDashboardStats(): Promise<DashboardStats> {
        const [usersSnapshot, generationsSnapshot, pendingTransactionsSnapshot] = await Promise.all([
            adminDb.collection('users').count().get(),
            adminDb.collection('agent_generations').count().get(),
            adminDb.collection('transactions').where('status', '==', 'pending').count().get()
        ]);

        const totalUsers = usersSnapshot.data().count;
        const totalGenerations = generationsSnapshot.data().count;
        const pendingPayments = pendingTransactionsSnapshot.data().count;

        // Agent Usage (Last 30 days)
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
        
        const agentUsageChartData = (await Promise.all(agentUsagePromises))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Recent Activity
        const recentGenerationsSnapshot = await adminDb.collection('agent_generations')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const activityPromises = recentGenerationsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userDoc = await adminDb.collection('users').doc(data.userId).get();
            return {
                id: doc.id,
                userName: userDoc.data()?.name || 'Unknown User',
                ...data
            };
        });

        const recentActivity = await Promise.all(activityPromises);

        return {
            totalUsers,
            totalGenerations,
            pendingPayments,
            agentUsageChartData,
            recentActivity
        };
    }
}
