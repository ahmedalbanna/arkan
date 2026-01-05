

'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { getUserProfile } from './userService';

interface GenerationLog {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number; // Add creditCost field
    createdAt: string; // ISO string
}

export interface GetLogsParams {
    limit: number;
    agentId?: string;
    userId?: string;
    lastVisibleId?: string;
}

/**
 * Logs a successful AI agent generation to Firestore.
 * This creates a knowledge base of all agent activities.
 * @param logData - The data to be logged.
 */
export async function logGeneration(logData: Omit<GenerationLog, 'createdAt'>): Promise<void> {
    try {
        const generationLog: GenerationLog = {
            ...logData,
            createdAt: new Date().toISOString(),
        };
        await adminDb.collection('agent_generations').add(generationLog);
    } catch (error) {
        console.error(`Failed to log generation for agent ${logData.agentId}:`, error);
        // We don't throw an error here to avoid failing the main user request.
        // The primary function (e.g., generating a proposal) should still succeed
        // even if logging fails.
    }
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

    const snapshot = await query.limit(limit + 1).get(); // Fetch one extra to check for next page

    const logsPromises = snapshot.docs.slice(0, limit).map(async (doc) => {
        const data = doc.data();
        const userProfile = await getUserProfile(data.userId);
        return {
            id: doc.id,
            userName: userProfile?.name || 'Unknown User', // Add user's name
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
