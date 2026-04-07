'use server';

/**
 * @fileOverview RAG-Enhanced Chapter Content Generation
 * 
 * This flow delegates chapter generation to the N8nAiService (→ n8n Chapter RAG Agent).
 * The n8n agent uses Qdrant vector search + OpenRouter LLM to produce the chapter content.
 * 
 * Falls back to local Genkit generation if N8N_AI_WEBHOOK_URL is not set.
 */

import { GenerateChapterInputSchema, type GenerateChapterInput, type GenerateChapterOutput } from '@/modules/ai/domain/schemas';
import { container } from '@/infrastructure/di/container';
import { IAiServiceToken } from '@/modules/ai/domain/services/IAiService';

export interface GenerateChapterWithRAGInput extends GenerateChapterInput {
  projectId?: string;
  userId?: string;
  enableRAG?: boolean;
  ragTopK?: number;
}

/**
 * Generate chapter content with RAG enhancement via N8nAiService → n8n Chapter RAG Agent.
 */
export async function generateChapterContentWithRAG(input: GenerateChapterWithRAGInput): Promise<GenerateChapterOutput> {
  const validation = GenerateChapterInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateChapterContentWithRAG: ${validation.error.message}`);
  }

  const aiService = container.resolve<any>(IAiServiceToken);
  const result = await aiService.generateChapterWithRAG(input);

  if (!result.isSuccess()) {
    throw new Error(`Chapter generation failed: ${result.error()?.message || 'Unknown error'}`);
  }

  const output = result.getValue();

  // Handle both string output (n8n text field) and structured output
  if (typeof output === 'string') {
    return {
      chapterTitle: input.chapterTitle,
      content: output,
    } as unknown as GenerateChapterOutput;
  }

  if (output && typeof output === 'object') {
    return output as GenerateChapterOutput;
  }

  throw new Error('Chapter generation returned an unexpected empty result.');
}
