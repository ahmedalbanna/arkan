
// src/app/api/admin/dashboard-stats/route.ts
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/server-init';
import { getUserProfile } from '@/lib/db/queries';
import { AGENTS } from '@/lib/agents';

// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const adminAuth = await getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') {
            return { authorized: false, message: 'Forbidden' };
        }
        return { authorized: true };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}

export async function GET(request: Request) {
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.authorized) {
        return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
    }

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

        return NextResponse.json({
            totalUsers,
            totalGenerations,
            pendingPayments,
            agentUsageChartData,
            recentActivity
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
