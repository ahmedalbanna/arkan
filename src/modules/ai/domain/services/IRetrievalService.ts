import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../errors/AiErrors";

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  projectId?: string;
  userId?: string;
  includeTypes?: Array<'report' | 'reference' | 'context' | 'user_upload'>;
  useCache?: boolean;
  rerank?: boolean;
  rerankStrategy?: 'cross-encoder' | 'bm25' | 'hybrid' | 'reciprocal-rank-fusion';
}

export interface RetrievalResult {
  context: string;
  sources: Array<{
    content: string;
    score: number;
    sourceFile?: string;
    type: string;
  }>;
}

export interface IRetrievalService {
  retrieveContext(query: string, options?: RetrievalOptions): Promise<Result<RetrievalResult, AiError>>;
}

export const IRetrievalServiceToken = Symbol("IRetrievalService");
