

'use server';

import { adminDb } from '@/lib/firebase/server-init';

interface GenerationLog {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number; // Add creditCost field
    createdAt: string; // ISO string
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