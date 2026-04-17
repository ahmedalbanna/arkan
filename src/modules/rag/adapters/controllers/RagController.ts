
import { delay, inject, injectable } from "tsyringe";
import { RetrieveContextUseCase } from "../../application/use-cases/RetrieveContextUseCase";
import { IndexDocumentUseCase } from "../../application/use-cases/IndexDocumentUseCase";
import { GetRagStatsUseCase } from "../../application/use-cases/GetRagStatsUseCase";
import { GetRagHealthStatusUseCase } from "../../application/use-cases/GetRagHealthStatusUseCase";
import { GetRagCacheStatsUseCase } from "../../application/use-cases/GetRagCacheStatsUseCase";
import { ClearRagCacheUseCase } from "../../application/use-cases/ClearRagCacheUseCase";
import { CheckRagSearchCacheHitUseCase } from "../../application/use-cases/CheckRagSearchCacheHitUseCase";
import { CompareRerankingUseCase } from "../../application/use-cases/CompareRerankingUseCase";
import { GetIndexedDocumentsUseCase } from "../../application/use-cases/GetIndexedDocumentsUseCase";
import { DeleteIndexedDocumentUseCase } from "../../application/use-cases/DeleteIndexedDocumentUseCase";
import type {
    RagControllerIndexingOptions,
    RagControllerIndexingResult,
    RagControllerIndexedDocumentRecord,
    RagControllerRecordFailedIndexingInput,
    RagControllerRetrievalOptions,
    RagControllerRetrievalResult,
} from "../../application/types/RagControllerTypes";
import { RagError } from "../../application/types/RagControllerTypes";
import { Result } from "@/infrastructure/utils/result";

@injectable()
export class RagController {
    constructor(
        @inject(delay(() => RetrieveContextUseCase))
        private retrieveContextUseCase: RetrieveContextUseCase,
        @inject(delay(() => IndexDocumentUseCase))
        private indexDocumentUseCase: IndexDocumentUseCase,
        @inject(delay(() => GetRagStatsUseCase))
        private getRagStatsUseCase: GetRagStatsUseCase,
        @inject(delay(() => GetRagHealthStatusUseCase))
        private getRagHealthStatusUseCase: GetRagHealthStatusUseCase,
        @inject(delay(() => GetRagCacheStatsUseCase))
        private getRagCacheStatsUseCase: GetRagCacheStatsUseCase,
        @inject(delay(() => ClearRagCacheUseCase))
        private clearRagCacheUseCase: ClearRagCacheUseCase,
        @inject(delay(() => CheckRagSearchCacheHitUseCase))
        private checkRagSearchCacheHitUseCase: CheckRagSearchCacheHitUseCase,
        @inject(delay(() => CompareRerankingUseCase))
        private compareRerankingUseCase: CompareRerankingUseCase,
        @inject(delay(() => GetIndexedDocumentsUseCase))
        private getIndexedDocumentsUseCase: GetIndexedDocumentsUseCase,
        @inject(delay(() => DeleteIndexedDocumentUseCase))
        private deleteIndexedDocumentUseCase: DeleteIndexedDocumentUseCase
    ) {}

    async retrieveContext(query: string, options: RagControllerRetrievalOptions): Promise<Result<RagControllerRetrievalResult, RagError>> {
        return this.retrieveContextUseCase.execute(query, options);
    }

    async indexDocument(content: string, options: RagControllerIndexingOptions): Promise<Result<RagControllerIndexingResult, RagError>> {
        return this.indexDocumentUseCase.execute(content, options);
    }

    async getStats(): Promise<Result<any, RagError>> {
        return this.getRagStatsUseCase.execute();
    }

    async getHealthStatus(): Promise<Result<any, RagError>> {
        return this.getRagHealthStatusUseCase.execute();
    }

    async getCacheStats(): Promise<Result<any, RagError>> {
        return this.getRagCacheStatsUseCase.execute();
    }

    async clearCache(): Promise<Result<void, RagError>> {
        return this.clearRagCacheUseCase.execute();
    }

    async isSearchCacheHit(query: string, options?: { projectId?: string; topK?: number; minScore?: number }): Promise<Result<boolean, RagError>> {
        return this.checkRagSearchCacheHitUseCase.execute(query, options);
    }

    async compareReranking(query: string, strategy?: 'cross-encoder' | 'bm25' | 'hybrid' | 'reciprocal-rank-fusion' | 'all'): Promise<Result<any, RagError>> {
        return this.compareRerankingUseCase.execute(query, strategy);
    }

    async getIndexedDocuments(limit?: number): Promise<Result<RagControllerIndexedDocumentRecord[], RagError>> {
        return this.getIndexedDocumentsUseCase.execute(limit);
    }

    async deleteIndexedDocument(options: { projectId?: string, sourceFile?: string }): Promise<Result<void, RagError>> {
        return this.deleteIndexedDocumentUseCase.execute(options);
    }

    async recordFailedIndexing(data: RagControllerRecordFailedIndexingInput): Promise<Result<string, RagError>> {
        return this.indexDocumentUseCase.recordFailed(data);
    }
}
