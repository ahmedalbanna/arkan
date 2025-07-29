
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/server-init';
import { AGENTS } from '@/lib/agents';
import { getUserProfile } from '@/lib/db/queries';

async function verifyUser(request: Request) {
    const adminAuth = await getAdminAuth();
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

async function getNewUserCredits(): Promise<number> {
    try {
        const settingsDoc = await adminDb.collection('settings').doc('defaults').get();
        if (settingsDoc.exists) {
            return settingsDoc.data()?.newUserCredits || 10;
        }
        return 10; // Fallback default
    } catch (error) {
        console.error("Could not fetch default settings, falling back to 10 credits.", error);
        return 10;
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
        
        // --- Correct Credits Used Calculation ---
        const defaultCredits = await getNewUserCredits();
        
        // Fetch all verified transactions for the user
        const verifiedTransactionsSnapshot = await adminDb.collection('transactions')
            .where('userId', '==', userCheck.userId)
            .where('status', '==', 'verified')
            .get();
            
        const purchasedCredits = verifiedTransactionsSnapshot.docs.reduce((sum, doc) => {
            return sum + (doc.data().credits || 0);
        }, 0);

        const totalCreditsGranted = defaultCredits + purchasedCredits;
        const creditsUsed = totalCreditsGranted - userProfile.credits;


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
