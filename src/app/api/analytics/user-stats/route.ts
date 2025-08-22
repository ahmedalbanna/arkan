

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/server-init';
import { AGENTS } from '@/lib/agents';
import { getUserProfile } from '@/lib/db/queries';

async function verifyUser(request: Request) {

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
        const userProfile = await getUserProfile(userCheck.userId);
        if (!userProfile) {
            return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
        }

        const generationsSnapshot = await adminDb.collection('agent_generations')
            .where('userId', '==', userCheck.userId)
            .orderBy('createdAt', 'desc')
            .get();

        const totalGenerations = generationsSnapshot.size;

        const agentUsage: Record<string, number> = {};
        let creditsUsed = 0;
        generationsSnapshot.forEach(doc => {
            const data = doc.data();
            const agentId = data.agentId;
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
            creditsUsed += data.creditCost || 0; // Sum the credit cost from each log
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
            creditsUsed,
            agentUsageChartData,
            recentActivity,
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
