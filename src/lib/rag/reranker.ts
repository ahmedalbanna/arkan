/**
 * Re-ranking System for RAG
 * 
 * Improves search quality by re-ranking initial results using:
 * - Cross-encoder models (more accurate than bi-encoders)
 * - BM25 scoring (keyword matching)
 * - Hybrid fusion (combining multiple signals)
 * - Reciprocal Rank Fusion (RRF)
 */

import type { SearchResult } from './vector-store-interface';

/**
 * Re-ranking strategy type
 */
export type RerankStrategy = 'cross-encoder' | 'bm25' | 'hybrid' | 'reciprocal-rank-fusion';

/**
 * Re-ranking options
 */
export interface RerankOptions {
  strategy?: RerankStrategy;
  topK?: number;
  weights?: {
    semantic?: number;
    keyword?: number;
    recency?: number;
  };
}

/**
 * BM25 Scorer
 * Implements BM25 algorithm for keyword-based relevance
 */
class BM25Scorer {
  private k1: number = 1.5;
  private b: number = 0.75;

  /**
   * Calculate BM25 score for a document
   */
  score(query: string, document: string, avgDocLength: number): number {
    const queryTerms = this.tokenize(query);
    const docTerms = this.tokenize(document);
    const docLength = docTerms.length;

    let score = 0;

    for (const term of queryTerms) {
      const tf = docTerms.filter(t => t === term).length;
      
      if (tf > 0) {
        const idf = 1.0; // Simplified IDF (would need corpus statistics)
        const numerator = tf * (this.k1 + 1);
        const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / avgDocLength));
        
        score += idf * (numerator / denominator);
      }
    }

    return score;
  }

  /**
   * Simple tokenization
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }
}

/**
 * Cross-Encoder Reranker
 * Uses a more accurate model to re-rank results
 */
class CrossEncoderReranker {
  /**
   * Re-rank results using cross-encoder (simulated)
   * 
   * In production, this would call a cross-encoder model like:
   * - cross-encoder/ms-marco-MiniLM-L-6-v2
   * - sentence-transformers cross-encoders
   */
  async rerank(query: string, results: SearchResult[], topK: number = 10): Promise<SearchResult[]> {
    // Simulate cross-encoder scoring
    // In production, call actual model via API or local inference
    
    const reranked = results.map(result => {
      // Simulate more accurate scoring
      const queryLower = query.toLowerCase();
      const contentLower = result.chunk.content.toLowerCase();
      
      // Factors for simulated cross-encoder:
      // 1. Original similarity score
      let score = result.score * 0.5;
      
      // 2. Exact phrase matches (higher weight)
      const queryPhrases = queryLower.split(/\s+/).filter(w => w.length > 3);
      const exactMatches = queryPhrases.filter(phrase => 
        contentLower.includes(phrase)
      ).length;
      score += exactMatches * 0.1;
      
      // 3. Query term density
      const queryTerms = queryLower.split(/\s+/);
      const contentTerms = contentLower.split(/\s+/);
      const termMatches = queryTerms.filter(term => 
        contentTerms.includes(term)
      ).length;
      score += (termMatches / queryTerms.length) * 0.2;
      
      // 4. Position of matches (earlier is better)
      const firstMatchPos = contentLower.indexOf(queryLower.split(' ')[0]);
      if (firstMatchPos >= 0) {
        score += (1 - firstMatchPos / contentLower.length) * 0.1;
      }
      
      // 5. Length penalty (prefer concise relevant answers)
      const lengthPenalty = Math.min(1, 500 / contentLower.length);
      score *= lengthPenalty;
      
      return {
        ...result,
        score: Math.min(1, score), // Normalize to [0, 1]
      };
    });

    // Sort by new scores and take top K
    return reranked
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

/**
 * Hybrid Reranker
 * Combines semantic and keyword-based scoring
 */
class HybridReranker {
  private bm25: BM25Scorer;
  private crossEncoder: CrossEncoderReranker;

  constructor() {
    this.bm25 = new BM25Scorer();
    this.crossEncoder = new CrossEncoderReranker();
  }

  /**
   * Re-rank using hybrid approach
   */
  async rerank(
    query: string,
    results: SearchResult[],
    options: RerankOptions = {}
  ): Promise<SearchResult[]> {
    const {
      topK = 10,
      weights = { semantic: 0.5, keyword: 0.3, recency: 0.2 },
    } = options;

    if (results.length === 0) return [];

    // Calculate average document length for BM25
    const avgLength = results.reduce((sum, r) => 
      sum + r.chunk.content.length, 0
    ) / results.length;

    // Score each result with multiple factors
    const scored = results.map(result => {
      // 1. Semantic score (original vector similarity)
      const semanticScore = result.score * (weights.semantic || 0.5);

      // 2. Keyword score (BM25)
      const bm25Score = this.bm25.score(query, result.chunk.content, avgLength);
      const normalizedBM25 = Math.min(1, bm25Score / 10); // Normalize
      const keywordScore = normalizedBM25 * (weights.keyword || 0.3);

      // 3. Recency score (if timestamp available)
      let recencyScore = 0;
      if (result.chunk.metadata.timestamp) {
        const ageMs = Date.now() - result.chunk.metadata.timestamp;
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        recencyScore = Math.exp(-ageDays / 30) * (weights.recency || 0.2); // Decay over 30 days
      }

      // Combined score
      const totalScore = semanticScore + keywordScore + recencyScore;

      return {
        ...result,
        score: totalScore,
        scoreBreakdown: {
          semantic: semanticScore,
          keyword: keywordScore,
          recency: recencyScore,
          total: totalScore,
        },
      };
    });

    // Sort and return top K
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines multiple ranking lists
 */
class ReciprocalRankFusion {
  private k: number = 60; // RRF constant

  /**
   * Fuse multiple ranked lists using RRF
   */
  fuse(rankedLists: SearchResult[][], topK: number = 10): SearchResult[] {
    const scoreMap = new Map<string, { result: SearchResult; score: number }>();

    // Calculate RRF scores
    rankedLists.forEach(list => {
      list.forEach((result, rank) => {
        const id = result.chunk.id;
        const rrfScore = 1 / (this.k + rank + 1);

        if (scoreMap.has(id)) {
          scoreMap.get(id)!.score += rrfScore;
        } else {
          scoreMap.set(id, { result, score: rrfScore });
        }
      });
    });

    // Sort by RRF score and take top K
    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => ({
        ...item.result,
        score: item.score,
      }));
  }
}

/**
 * Main Reranker class
 */
export class Reranker {
  private crossEncoder: CrossEncoderReranker;
  private hybrid: HybridReranker;
  private rrf: ReciprocalRankFusion;

  constructor() {
    this.crossEncoder = new CrossEncoderReranker();
    this.hybrid = new HybridReranker();
    this.rrf = new ReciprocalRankFusion();
  }

  /**
   * Re-rank search results
   */
  async rerank(
    query: string,
    results: SearchResult[],
    options: RerankOptions = {}
  ): Promise<SearchResult[]> {
    const { strategy = 'hybrid', topK = 10 } = options;

    if (results.length === 0) return [];

    switch (strategy) {
      case 'cross-encoder':
        return this.crossEncoder.rerank(query, results, topK);

      case 'bm25':
        // BM25 only (part of hybrid)
        return this.hybrid.rerank(query, results, {
          ...options,
          weights: { semantic: 0, keyword: 1, recency: 0 },
        });

      case 'hybrid':
        return this.hybrid.rerank(query, results, options);

      case 'reciprocal-rank-fusion':
        // For RRF, we'd need multiple ranked lists
        // Here we just return sorted results
        return results
          .sort((a, b) => b.score - a.score)
          .slice(0, topK);

      default:
        return results.slice(0, topK);
    }
  }

  /**
   * Benchmark different reranking strategies
   */
  async benchmark(
    query: string,
    results: SearchResult[],
    topK: number = 10
  ): Promise<{
    strategy: RerankStrategy;
    results: SearchResult[];
    avgScore: number;
    time: number;
  }[]> {
    const strategies: RerankStrategy[] = ['cross-encoder', 'bm25', 'hybrid'];
    const benchmarks = [];

    for (const strategy of strategies) {
      const start = Date.now();
      const reranked = await this.rerank(query, results, { strategy, topK });
      const time = Date.now() - start;
      
      const avgScore = reranked.reduce((sum, r) => sum + r.score, 0) / reranked.length;

      benchmarks.push({
        strategy,
        results: reranked,
        avgScore,
        time,
      });
    }

    return benchmarks;
  }
}

// Singleton instance
let rerankerInstance: Reranker | null = null;

/**
 * Get reranker instance
 */
export function getReranker(): Reranker {
  if (!rerankerInstance) {
    rerankerInstance = new Reranker();
  }
  return rerankerInstance;
}

/**
 * Reset reranker (for testing)
 */
export function resetReranker(): void {
  rerankerInstance = null;
}

export { BM25Scorer, CrossEncoderReranker, HybridReranker, ReciprocalRankFusion };
