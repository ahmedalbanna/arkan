'use server';

/**
 * @fileOverview RAG-Enhanced Report Section Generation
 * 
 * This flow delegates section generation to the N8nAiService (→ n8n Section RAG Agent).
 * The n8n agent uses Qdrant vector search + OpenRouter LLM to produce the section content.
 * 
 * Falls back gracefully if N8N_AI_WEBHOOK_URL is not set.
 */

import { GenerateSectionInputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/modules/ai/domain/schemas';
import { container } from '@/infrastructure/di/container';
import { IAiServiceToken } from '@/modules/ai/domain/services/IAiService';

export interface GenerateSectionWithRAGInput extends GenerateSectionInput {
  projectId?: string;
  userId?: string;
  enableRAG?: boolean;
  ragTopK?: number;
}

/**
 * Generate a report section with RAG enhancement via N8nAiService → n8n Section RAG Agent.
 */
export async function generateReportSectionWithRAG(input: GenerateSectionWithRAGInput): Promise<GenerateSectionOutput> {
  const validation = GenerateSectionInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateReportSectionWithRAG: ${validation.error.message}`);
  }

  const aiService = container.resolve<any>(IAiServiceToken);
  const result = await aiService.generateSectionWithRAG(input);

  if (!result.isSuccess()) {
    throw new Error(`Section generation failed: ${result.error()?.message || 'Unknown error'}`);
  }

  const output = result.getValue();

  // Handle both string output (n8n text field) and structured output
  if (typeof output === 'string') {
    return {
      sectionName: input.sectionToGenerate,
      content: output,
    } as GenerateSectionOutput;
  }

  if (output && typeof output === 'object') {
    return output as GenerateSectionOutput;
  }

  throw new Error('Section generation returned an unexpected empty result.');
}
