/**
 * Demo Benchmark API
 * Runs performance benchmarks and streams results
 */

import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

export async function POST(_request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const testQueries = [
          'What is machine learning?',
          'How to build web applications?',
          'Explain vector databases',
          'What is semantic search?',
          'Tell me about React',
        ];

        const scenarios = [
          { name: 'Without Cache', useCache: false, rerank: false },
          { name: 'With Cache', useCache: true, rerank: false },
          { name: 'With Cache + Re-ranking', useCache: true, rerank: true },
        ];

        const controllerInstance = container.resolve(RagController);
        const totalSteps = scenarios.length * testQueries.length;
        let currentStep = 0;

        for (const scenario of scenarios) {
          const times: number[] = [];
          let cacheHits = 0;

          // Run queries for this scenario
          for (const query of testQueries) {
            const startTime = Date.now();
            
            if (scenario.useCache) {
              const cacheHitResult = await controllerInstance.isSearchCacheHit(query, {});
              if (cacheHitResult.isSuccess && cacheHitResult.getValue()) {
                cacheHits++;
              }
            }

            await controllerInstance.retrieveContext(query, {
              topK: 5,
              minScore: 0.5,
              useCache: scenario.useCache,
              rerank: scenario.rerank,
            });

            const time = Date.now() - startTime;
            times.push(time);

            currentStep++;
            const progress = Math.round((currentStep / totalSteps) * 100);

            // Send progress update
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
            );

            // Small delay between queries
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Calculate statistics
          const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
          const minTime = Math.min(...times);
          const maxTime = Math.max(...times);

          const result = {
            scenario: scenario.name,
            avgTime,
            minTime,
            maxTime,
            cacheHits,
            totalQueries: testQueries.length,
          };

          // Send result
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ result })}\n\n`)
          );
        }

        controller.close();
      } catch (error) {
        console.error('Benchmark error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
