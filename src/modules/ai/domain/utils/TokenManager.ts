/**
 * Simple Token Estimation Utility
 * 
 * Since we don't have a native tokenizer for Gemma/Phi in JS easily,
 * we use a heuristic based on the average token-to-word ratio (~1.3 tokens/word).
 */

export const MODEL_CONTEXT_LIMITS = {
  GEMMA_2B: 8192,
  PHI3_MINI: 4096,
  LLAMA3_8B: 8192,
} as const;

export class TokenManager {
  /**
   * Estimate token count for a string
   */
  static estimateTokens(text: string): number {
    if (!text) return 0;
    
    // Heuristic: ~1.3 tokens per word
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount * 1.3);
  }

  /**
   * Truncate context to fit within a limit
   */
  static truncateToLimit(text: string, maxTokens: number): string {
    const estimated = this.estimateTokens(text);
    if (estimated <= maxTokens) return text;

    // Calculate how many words we can keep
    const maxWords = Math.floor(maxTokens / 1.3);
    const words = text.split(/\s+/);
    
    // Take the most recent/relevant part (usually the end for context)
    // For RAG we might want the beginning if it's ordered by relevance
    return words.slice(0, maxWords).join(' ');
  }

  /**
   * Truncate RAG context specifically (preserving block structure)
   */
  static truncateRagContext(context: string, maxTokens: number): string {
    const blocks = context.split('\n\n---\n\n');
    let currentTokens = 0;
    const keptBlocks: string[] = [];

    for (const block of blocks) {
      const blockTokens = this.estimateTokens(block);
      if (currentTokens + blockTokens + 10 > maxTokens) break; // +10 for separator
      
      keptBlocks.push(block);
      currentTokens += blockTokens + 10;
    }

    return keptBlocks.join('\n\n---\n\n');
  }
}
