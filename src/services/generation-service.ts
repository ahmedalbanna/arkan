

'use server';

import { prisma } from '@/lib/db/prisma';

interface GenerationLog {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number;
    createdAt: string; // ISO string
}

/**
 * Logs a successful AI agent generation to PostgreSQL.
 * This creates a knowledge base of all agent activities.
 * @param logData - The data to be logged.
 */
export async function logGeneration(logData: Omit<GenerationLog, 'createdAt'>): Promise<void> {
    try {
        await prisma.generationLog.create({
            data: {
                userId: logData.userId,
                flowName: logData.agentId, // Use agentId as flowName
                input: logData.input,
                output: logData.output,
                metadata: {
                    creditCost: logData.creditCost,
                },
                status: 'success',
            },
        });
    } catch (error) {
        console.error(`Failed to log generation for agent ${logData.agentId}:`, error);
        // We don't throw an error here to avoid failing the main user request.
        // The primary function (e.g., generating a proposal) should still succeed
        // even if logging fails.
    }
}