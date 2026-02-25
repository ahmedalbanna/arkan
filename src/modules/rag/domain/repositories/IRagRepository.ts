
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

export interface IRagRepository {
    indexDocument(content: string, options?: RagIndexingOptions): Promise<RagIndexingResult>;
    retrieveContext(query: string, options?: RagRetrievalOptions): Promise<RagRetrievalResult>;
    getStats(): Promise<{ totalChunks: number }>;
    clear(): Promise<void>;
}

export const IRagRepositoryToken = Symbol("IRagRepository");
