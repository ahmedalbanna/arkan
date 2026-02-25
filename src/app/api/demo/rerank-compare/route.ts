/**
 * Demo Re-ranking Comparison API
 * Compare different re-ranking strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/modules/rag/infrastructure/embeddings';
import { getVectorStore } from '@/modules/rag/infrastructure/vector-store';
import { getReranker } from '@/modules/rag/infrastructure/reranker';
import type { RerankStrategy } from '@/modules/rag/infrastructure/reranker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, strategy = 'all' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get initial search results
    const queryEmbedding = await generateEmbedding(query);
    const vectorStore = getVectorStore();
    const initialResults = await vectorStore.search(queryEmbedding, {
      topK: 10,
      minScore: 0.3,
    });

    if (initialResults.length === 0) {
      return NextResponse.json({
        comparisons: [],
        message: 'No results found for comparison',
      });
    }

    // Determine which strategies to test
    const strategies: RerankStrategy[] = 
      strategy === 'all' 
        ? ['cross-encoder', 'bm25', 'hybrid']
        : [strategy as RerankStrategy];

    // Run comparison
    const reranker = getReranker();
    const comparisons = await Promise.all(
      strategies.map(async (strat) => {
        const startTime = Date.now();
        const reranked = await reranker.rerank(query, initialResults, {
          strategy: strat,
          topK: 5,
        });
        const time = Date.now() - startTime;

        const avgScore = reranked.reduce((sum, r) => sum + r.score, 0) / reranked.length;

        return {
          strategy: strat,
          results: reranked.map(r => ({
            content: r.chunk.content,
            score: r.score,
            sourceFile: r.chunk.metadata.sourceFile,
          })),
          avgScore,
          time,
        };
      })
    );

    return NextResponse.json({
      comparisons,
      initialResultCount: initialResults.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Re-ranking comparison error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Comparison failed',
        comparisons: [],
      },
      { status: 500 }
    );
  }
}
