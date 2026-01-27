import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server-init';
import { listDocs, getDoc } from '@/lib/firebase/db-helpers';
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
    } catch (error) {
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

        let generations = await listDocs('agent_generations', {
            filters: [{ field: 'userId', operator: '==' as const, value: userCheck.userId }],
            orderBy: { field: 'createdAt', direction: 'desc' },
        });

        let totalGenerations = generations.length;

        let agentUsage: Record<string, number> = {};
        let creditsUsed = 0;
        generations.forEach((doc: any) => {
            let agentId = doc.agentId;
            agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
            creditsUsed += doc.creditCost || 0;
        });

        let agentUsagePromises = Object.entries(agentUsage).map(async ([agentId, count]) => {
            let agent = await getDoc('agents', agentId);
            return {
                name: (agent as any)?.name || 'Unknown',
                agentId,
                count,
            };
        });

        let agentUsageChartData = (await Promise.all(agentUsagePromises))
            .sort((a, b) => b.count - a.count) // Sort after all promises are resolved
            .slice(0, 10);

        let recentActivity = generations.slice(0, 5);


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
