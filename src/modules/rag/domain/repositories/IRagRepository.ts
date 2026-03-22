
export interface RagIndexingOptions {
    userId?: string;
    projectId?: string;
    sourceFile?: string;
    type?: 'report' | 'reference' | 'context' | 'user_upload';
    chunkSize?: number;
    overlap?: number;
}

export interface RagRetrievalOptions {
    topK?: number;
    minScore?: number;
    projectId?: string;
    userId?: string;
    includeTypes?: Array<'report' | 'reference' | 'context' | 'user_upload'>;
    useCache?: boolean;
    rerank?: boolean;
    rerankStrategy?: 'cross-encoder' | 'bm25' | 'hybrid' | 'reciprocal-rank-fusion';
}

export interface RagIndexingResult {
    success: boolean;
    chunksCreated: number;
    errors?: string[];
}

export interface RagRetrievalResult {
    context: string;
    sources: Array<{
        content: string;
        score: number;
        sourceFile?: string;
        type: string;
    }>;
}

export interface RagCacheStats {
    embeddings: {
        size: number;
        hits: number;
        misses: number;
        hitRate: number;
        evictions: number;
    };
    searches: {
        size: number;
        hits: number;
        misses: number;
        hitRate: number;
        evictions: number;
    };
    total: {
        size: number;
        hitRate: number;
    };
}

export type RagSearchCacheLookupOptions = Pick<RagRetrievalOptions, 'projectId' | 'topK' | 'minScore'>;

export interface RagHealthCheck {
    status: 'ok' | 'error';
    details: Record<string, unknown>;
}

export interface RagHealthStatus {
    status: 'healthy' | 'degraded';
    timestamp: string;
    checks: {
        config: RagHealthCheck;
        vectorStore: RagHealthCheck;
        ollama: RagHealthCheck;
    };
    config: {
        provider: string;
        embeddingModel: string;
        vectorDimension: number;
    };
}

export type RagRerankStrategy = Exclude<RagRetrievalOptions['rerankStrategy'], undefined>;

export interface RagRerankComparison {
    strategy: RagRerankStrategy;
    results: Array<{
        content: string;
        score: number;
        sourceFile?: string;
    }>;
    avgScore: number;
    time: number;
}

export interface RagRerankComparisonResult {
    comparisons: RagRerankComparison[];
    initialResultCount: number;
}

import { Result } from "@/lib/utils/result";
import { RagError } from "../errors/RagErrors";

export interface IRagRepository {
    indexDocument(content: string, options?: RagIndexingOptions): Promise<Result<RagIndexingResult, RagError>>;
    retrieveContext(query: string, options?: RagRetrievalOptions): Promise<Result<RagRetrievalResult, RagError>>;
    getStats(): Promise<Result<{ totalChunks: number }, RagError>>;
    getHealthStatus(): Promise<Result<RagHealthStatus, RagError>>;
    compareReranking(query: string, strategy?: RagRerankStrategy | 'all'): Promise<Result<RagRerankComparisonResult, RagError>>;
    getCacheStats(): Promise<Result<RagCacheStats, RagError>>;
    isSearchCacheHit(query: string, options?: RagSearchCacheLookupOptions): Promise<Result<boolean, RagError>>;
    clearCache(): Promise<Result<void, RagError>>;
    clear(): Promise<Result<void, RagError>>;
}

export const IRagRepositoryToken = Symbol("IRagRepository");
