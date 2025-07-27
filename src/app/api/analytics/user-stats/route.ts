
import { NextResponse } from 'next/server';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import { AGENTS } from '@/lib/agents';

async function verifyUser(request: Request) {
    const adminAuth = getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized', userId: null };
    }
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        return { authorized: true, userId: decodedToken.uid };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized', userId: null };
    }
}

export async function GET(request: Request) {
    const userCheck = await verifyUser(request);
    if (!userCheck.authorized || !userCheck.userId) {
        return NextResponse.json({ message: userCheck.message }, { status: 401 });
    }

    try {
        const generationsSnapshot = await adminDb.collection('agent_generations')
            .where('userId', '==', userCheck.userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        const totalGenerations = generationsSnapshot.size;
        
        const agentUsage: Record<string, number> = {};
        generationsSnapshot.forEach(doc => {
            const agentId = doc.data().agentId;
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
        });

        const agentUsageChartData = Object.entries(agentUsage)
            .map(([agentId, count]) => ({
                name: AGENTS.find(a => a.id === agentId)?.name || agentId,
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const recentActivity = generationsSnapshot.docs.slice(0, 5).map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            totalGenerations,
            agentUsageChartData,
            recentActivity,
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
