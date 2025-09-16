
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


// --- Client-side API functions ---
// These functions are called by React Query mutations in the UI hooks.

export async function generateCodeApi(variables: { prompt: string; token: string }) {
    const response = await fetch('/api/generate/code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${variables.token}`,
        },
        body: JSON.stringify({ prompt: variables.prompt }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate code');
    }
    return await response.json();
}

export async function generateCodebaseApi(variables: { proposal: any; token: string }) {
    const response = await fetch('/api/generate/codebase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${variables.token}`,
        },
        body: JSON.stringify({ proposal: variables.proposal }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate codebase');
    }
    return await response.json();
}
