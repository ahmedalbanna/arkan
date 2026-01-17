import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';

import { getUserProfile } from '@/services/userService';

async function verifyUser(request: Request) {

    let authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized', userId: null };
    }
    let token = authorization.substring(7);
    try {
        let decodedToken = await adminAuth.verifyIdToken(token, true);
        return { authorized: true, userId: decodedToken.uid };
    } catch (_error) {
        return { authorized: false, message: 'Unauthorized', userId: null };
    }
}

export async function GET(request: Request) {
    let userCheck = await verifyUser(request);
    if (!userCheck.authorized || !userCheck.userId) {
        return NextResponse.json({ message: userCheck.message }, { status: 401 });
    }

    try {
        let userProfile = await getUserProfile(userCheck.userId);
        if (!userProfile) {
            return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
        }

        let generationsSnapshot = await adminDb.collection('agent_generations')
            .where('userId', '==', userCheck.userId)
            .orderBy('createdAt', 'desc')
            .get();

        let totalGenerations = generationsSnapshot.size;

        let agentUsage: Record<string, number> = {};
        let creditsUsed = 0;
        generationsSnapshot.forEach(doc => {
            let data = doc.data();
            let agentId = data.agentId;
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
            creditsUsed += data.creditCost || 0;
        });

        let agentUsagePromises = Object.entries(agentUsage).map(async ([agentId, count]) => ({
                name: await adminDb.collection('agents').doc(agentId).get().then(doc => doc.data()?.name || 'Unknown'),
                agentId,
                count,
            }));

        let agentUsageChartData = (await Promise.all(agentUsagePromises))
            .sort((a, b) => b.count - a.count) // Sort after all promises are resolved
            .slice(0, 10);

        let recentActivity = generationsSnapshot.docs.slice(0, 5).map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        return NextResponse.json({
            totalGenerations,
            creditsUsed,
            agentUsageChartData,
            recentActivity,
        }, { status: 200 });

    } catch (_error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
