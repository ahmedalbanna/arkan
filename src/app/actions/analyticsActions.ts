
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { requireAdmin, requireUser } from './_utils/auth';
import { getUserProfile } from './userActions';

// ============================================================================
// GENERATION LOG SERVICE
// ============================================================================

interface GenerationLog {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number;
    createdAt: string;
}

export async function logGeneration(logData: Omit<GenerationLog, 'createdAt'>): Promise<void> {
    try {
        const generationLog: GenerationLog = {
            ...logData,
            createdAt: new Date().toISOString(),
        };
        await adminDb.collection('agent_generations').add(generationLog);
    } catch (error) {
        console.error(`Failed to log generation for agent ${logData.agentId}:`, error);
        // Do not re-throw to avoid failing the main user request
    }
}

export interface GetLogsParams {
    limit: number;
    agentId?: string;
    userId?: string;
    lastVisibleId?: string;
}

export async function getGenerationLogs({ limit, agentId, userId, lastVisibleId }: GetLogsParams) {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('agent_generations');

    if (agentId) {
        query = query.where('agentId', '==', agentId);
    }
    if (userId) {
        query = query.where('userId', '==', userId);
    }

    query = query.orderBy('createdAt', 'desc');

    if (lastVisibleId) {
        const lastDoc = await adminDb.collection('agent_generations').doc(lastVisibleId).get();
        if (lastDoc.exists) {
            query = query.startAfter(lastDoc);
        }
    }

    const snapshot = await query.limit(limit + 1).get();

    const logsPromises = snapshot.docs.slice(0, limit).map(async (doc) => {
        const data = doc.data();
        const userProfile = await getUserProfile(data.userId);
        return {
            id: doc.id,
            userName: userProfile?.name || 'Unknown User',
            ...data
        };
    });

    const logs = await Promise.all(logsPromises);
    const hasNextPage = snapshot.docs.length > limit;
    const newLastVisibleId = hasNextPage && logs.length > 0 ? logs[logs.length - 1].id : null;

    return {
        logs,
        hasNextPage,
        lastVisibleId: newLastVisibleId,
    };
}


// ============================================================================
// DASHBOARD STATS ACTIONS
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  totalGenerations: number;
  pendingPayments: number;
  agentUsageChartData: { name: string; agentId: string; count: number }[];
  recentActivity: { id: string; userId: string; userName: string; agentId: string; createdAt: string; input: any; output: any }[];
}

export async function getAdminDashboardStatsAction(): Promise<DashboardStats> {
  await requireAdmin();
  const [usersSnapshot, generationsSnapshot, pendingTransactionsSnapshot] = await Promise.all([
    adminDb.collection('users').count().get(),
    adminDb.collection('agent_generations').count().get(),
    adminDb.collection('transactions').where('status','==','pending').count().get(),
  ]);
  const summary = {
    totalUsers: usersSnapshot.data().count,
    totalGenerations: generationsSnapshot.data().count,
    pendingPayments: pendingTransactionsSnapshot.data().count,
  };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const agentGenerations = await adminDb.collection('agent_generations')
    .where('createdAt', '>=', thirtyDaysAgo.toISOString())
    .get();
  const usage: Record<string, number> = {};
  agentGenerations.forEach(doc => { const a = (doc.data() as any).agentId; usage[a] = (usage[a]||0)+1; });
  const usageList = await Promise.all(Object.entries(usage).map(async ([agentId, count]) => ({
    name: await adminDb.collection('agents').doc(agentId).get().then(d => d.data()?.name || 'Unknown'),
    agentId,
    count,
  })));

  const recentGenSnapshot = await adminDb.collection('agent_generations').orderBy('createdAt','desc').limit(5).get();
  const recentActivity = await Promise.all(recentGenSnapshot.docs.map(async (doc) => {
    const data = doc.data() as any;
    const userDoc = await adminDb.collection('users').doc(data.userId).get();
    const userName = (userDoc.data() as any)?.name || 'Unknown User';
    return { id: doc.id, userName, ...data };
  }));

  return { ...summary, agentUsageChartData: usageList.sort((a,b)=>b.count-a.count).slice(0,10), recentActivity };
}

export interface UserDashboardStats {
  totalGenerations: number;
  creditsUsed: number;
  agentUsageChartData: { name: string; agentId: string; count: number }[];
  recentActivity: { id: string; userId: string; agentId: string; createdAt: string; input: any; output: any }[];
}

export async function getUserStatsAction(): Promise<UserDashboardStats> {
  const user = await requireUser();
  const generationsSnapshot = await adminDb.collection('agent_generations')
    .where('userId','==', user.id)
    .orderBy('createdAt','desc')
    .get();
  const totalGenerations = generationsSnapshot.size;
  const usage: Record<string, number> = {};
  let creditsUsed = 0;
  generationsSnapshot.forEach(doc => { const data = doc.data() as any; usage[data.agentId]=(usage[data.agentId]||0)+1; creditsUsed += data.creditCost||0; });
  const usageList = await Promise.all(Object.entries(usage).map(async ([agentId, count])=>({
    name: await adminDb.collection('agents').doc(agentId).get().then(d=>d.data()?.name || 'Unknown'),
    agentId,
    count,
  })));
  const recentActivity = generationsSnapshot.docs.slice(0,5).map(doc=>({ id: doc.id, ...(doc.data() as any) }));
  return { totalGenerations, creditsUsed, agentUsageChartData: usageList.sort((a,b)=>b.count-a.count).slice(0,10), recentActivity };
}
