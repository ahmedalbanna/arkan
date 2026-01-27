
'use server';

import { createDoc } from '@/lib/firebase/db-helpers';

interface GenerationLog {
  agentId: string;
  userId: string;
  input: any;
  output: any;
  creditCost: number;
  createdAt: string;
}

/**
 * Logs a successful AI agent generation to Firestore.
 * This creates a knowledge base of all agent activities.
 * Non-blocking: errors don't fail the main operation
 * @param logData - The data to be logged (excluding auto-generated createdAt)
 */
export async function logGeneration(
  logData: Omit<GenerationLog, 'createdAt'>
): Promise<void> {
  try {
    const generationLog: GenerationLog = {
      ...logData,
      createdAt: new Date().toISOString(),
    };
    await createDoc<GenerationLog>('agent_generations', generationLog);
  } catch (error) {
    console.error(`Failed to log generation for agent ${logData.agentId}:`, error);
    // We don't throw an error here to avoid failing the main user request.
    // The primary function (e.g., generating a proposal) should still succeed
    // even if logging fails.
  }
}
