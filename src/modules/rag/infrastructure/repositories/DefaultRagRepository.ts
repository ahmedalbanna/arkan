
import { injectable } from "tsyringe";
import { IRagRepository, RagIndexingOptions, RagRetrievalOptions, RagIndexingResult, RagRetrievalResult, RagCacheStats, RagHealthStatus, RagRerankComparisonResult, RagRerankStrategy, RagSearchCacheLookupOptions } from "../../domain/repositories/IRagRepository";
import { indexDocument } from "@/modules/rag/infrastructure/indexer";
import { retrieveContext } from "@/modules/rag/infrastructure/retrieval";
import { getCacheManager } from "@/modules/rag/infrastructure/cache";
import { RAGConfig, validateRAGConfig } from "@/modules/rag/infrastructure/config";
import { generateEmbedding } from "@/modules/rag/infrastructure/embeddings";
import { getReranker, type RerankStrategy } from "@/modules/rag/infrastructure/reranker";
import { getVectorStore } from "@/modules/rag/infrastructure/vector-store";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class DefaultRagRepository implements IRagRepository {
    async indexDocument(content: string, options?: RagIndexingOptions): Promise<Result<RagIndexingResult, RagError>> {
        try {
            const result = await indexDocument(content, options);
            const formattedResult = {
                success: result.success,
                chunksCreated: result.chunksCreated,
                errors: result.errors
            };

            if (!result.success) {
                return Result.fail(RagError.indexingFailed("Document indexing failed", result.errors));
            }

            return Result.ok(formattedResult);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.indexingFailed(message));
        }
    }

    async retrieveContext(query: string, options?: RagRetrievalOptions): Promise<Result<RagRetrievalResult, RagError>> {
        try {
            const result = await retrieveContext(query, options);
            return Result.ok({
                sources: result.sources,
                context: result.context
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.retrievalFailed(message));
        }
    }

    async getStats(): Promise<Result<{ totalChunks: number }, RagError>> {
        try {
            const vectorStore = getVectorStore();
            let totalChunks = 0;
            if (typeof vectorStore.size === 'function') {
                totalChunks = await vectorStore.size();
            } else {
                totalChunks = vectorStore.size();
            }
            return Result.ok({
                totalChunks,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.vectorStoreError(message));
        }
    }

    async getHealthStatus(): Promise<Result<RagHealthStatus, RagError>> {
        try {
            const checks: RagHealthStatus['checks'] = {
                config: { status: 'unknown' as 'ok' | 'error', details: {} },
                vectorStore: { status: 'unknown' as 'ok' | 'error', details: {} },
                ollama: { status: 'unknown' as 'ok' | 'error', details: {} },
            };

            const configValidation = validateRAGConfig();
            checks.config.status = configValidation.valid ? 'ok' : 'error';
            checks.config.details = {
                provider: RAGConfig.vectorStore.provider,
                dimension: RAGConfig.vectorStore.dimension,
                errors: configValidation.errors,
            };

            try {
                const vectorStore = getVectorStore();
                if (typeof vectorStore.healthCheck === 'function') {
                    const isHealthy = await vectorStore.healthCheck();
                    checks.vectorStore.status = isHealthy ? 'ok' : 'error';

                    if (isHealthy && typeof vectorStore.getStats === 'function') {
                        const stats = await vectorStore.getStats();
                        checks.vectorStore.details = {
                            type: 'qdrant',
                            url: RAGConfig.qdrant.url,
                            collection: RAGConfig.qdrant.collectionName,
                            totalChunks: stats.totalChunks,
                            vectorDimension: stats.vectorDimension,
                        };
                    } else {
                        checks.vectorStore.details = { error: 'Health check failed' };
                    }
                } else {
                    const size = typeof vectorStore.size === 'function'
                        ? await vectorStore.size()
                        : vectorStore.size();

                    checks.vectorStore.status = 'ok';
                    checks.vectorStore.details = {
                        type: 'memory',
                        totalChunks: size,
                    };
                }
            } catch (error: unknown) {
                checks.vectorStore.status = 'error';
                checks.vectorStore.details = {
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }

            try {
                const response = await fetch(`${RAGConfig.ollama.baseUrl}/api/tags`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000),
                });

                if (response.ok) {
                    const data = await response.json() as { models?: Array<{ name: string }> };
                    const hasEmbeddingModel = data.models?.some(
                        (model) => model.name.includes(RAGConfig.ollama.embeddingModel)
                    ) ?? false;

                    checks.ollama.status = hasEmbeddingModel ? 'ok' : 'error';
                    checks.ollama.details = {
                        url: RAGConfig.ollama.baseUrl,
                        model: RAGConfig.ollama.embeddingModel,
                        modelAvailable: hasEmbeddingModel,
                        availableModels: data.models?.map((model) => model.name).slice(0, 5) ?? [],
                    };
                } else {
                    checks.ollama.status = 'error';
                    checks.ollama.details = {
                        error: `HTTP ${response.status}: ${response.statusText}`,
                    };
                }
            } catch (error: unknown) {
                checks.ollama.status = 'error';
                checks.ollama.details = {
                    error: error instanceof Error ? error.message : 'Connection failed',
                    url: RAGConfig.ollama.baseUrl,
                };
            }

            const allOk = Object.values(checks).every((check) => check.status === 'ok');
            return Result.ok({
                status: allOk ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                checks,
                config: {
                    provider: RAGConfig.vectorStore.provider,
                    embeddingModel: RAGConfig.ollama.embeddingModel,
                    vectorDimension: RAGConfig.vectorStore.dimension,
                },
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.internal(message));
        }
    }

    async compareReranking(query: string, strategy: RagRerankStrategy | 'all' = 'all'): Promise<Result<RagRerankComparisonResult, RagError>> {
        try {
            const queryEmbedding = await generateEmbedding(query);
            const vectorStore = getVectorStore();
            const initialResults = await vectorStore.search(queryEmbedding, {
                topK: 10,
                minScore: 0.3,
            });

            if (initialResults.length === 0) {
                return Result.ok({ comparisons: [], initialResultCount: 0 });
            }

            const reranker = getReranker();

            if (strategy !== 'all') {
                const startTime = Date.now();
                const rerankedResults = await reranker.rerank(query, initialResults, {
                    strategy: strategy as RerankStrategy,
                    topK: 5,
                });
                const elapsed = Date.now() - startTime;
                const avgScore = rerankedResults.length > 0
                    ? rerankedResults.reduce((sum, item) => sum + item.score, 0) / rerankedResults.length
                    : 0;

                return Result.ok({
                    comparisons: [{
                        strategy,
                        results: rerankedResults.map((item) => ({
                            content: item.chunk.content,
                            score: item.score,
                            sourceFile: item.chunk.metadata.sourceFile,
                        })),
                        avgScore,
                        time: elapsed,
                    }],
                    initialResultCount: initialResults.length,
                });
            }

            const benchmarkComparisons = await reranker.benchmark(query, initialResults, 5);
            const formattedComparisons = benchmarkComparisons.map((comparison) => ({
                strategy: comparison.strategy,
                results: comparison.results.map((item) => ({
                    content: item.chunk.content,
                    score: item.score,
                    sourceFile: item.chunk.metadata.sourceFile,
                })),
                avgScore: comparison.avgScore,
                time: comparison.time,
            }));

            return Result.ok({
                comparisons: formattedComparisons,
                initialResultCount: initialResults.length,
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.retrievalFailed(message));
        }
    }

    async getCacheStats(): Promise<Result<RagCacheStats, RagError>> {
        try {
            const cacheManager = getCacheManager();
            return Result.ok(cacheManager.getAllStats());
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.internal(message));
        }
    }

    async isSearchCacheHit(query: string, options?: RagSearchCacheLookupOptions): Promise<Result<boolean, RagError>> {
        try {
            const cacheManager = getCacheManager();
            const cache = cacheManager.getSearchCache();
            return Result.ok(cache.getResults(query, options ?? {}) !== null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.internal(message));
        }
    }

    async clearCache(): Promise<Result<void, RagError>> {
        try {
            const cacheManager = getCacheManager();
            cacheManager.clearAll();
            return Result.ok();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.internal(message));
        }
    }

    async clear(): Promise<Result<void, RagError>> {
        try {
            const vectorStore = getVectorStore();
            await vectorStore.clear();
            return Result.ok();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return Result.fail(RagError.vectorStoreError(message));
        }
    }
}
