
import { delay, inject, injectable } from "tsyringe";
import type { RagIndexingOptions, RagRetrievalOptions } from "../../domain/repositories/IRagRepository";
import type { IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";
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

    async retrieveContext(query: string, options: RagRetrievalOptions) {
        return this.retrieveContextUseCase.execute(query, options);
    }

    async indexDocument(content: string, options: RagIndexingOptions) {
        return this.indexDocumentUseCase.execute(content, options);
    }

    async getStats() {
        return this.getRagStatsUseCase.execute();
    }

    async getHealthStatus() {
        return this.getRagHealthStatusUseCase.execute();
    }

    async getCacheStats() {
        return this.getRagCacheStatsUseCase.execute();
    }

    async clearCache() {
        return this.clearRagCacheUseCase.execute();
    }

    async isSearchCacheHit(query: string, options?: { projectId?: string; topK?: number; minScore?: number }) {
        return this.checkRagSearchCacheHitUseCase.execute(query, options);
    }

    async compareReranking(query: string, strategy?: 'cross-encoder' | 'bm25' | 'hybrid' | 'reciprocal-rank-fusion' | 'all') {
        return this.compareRerankingUseCase.execute(query, strategy);
    }

    async getIndexedDocuments(limit?: number) {
        return this.getIndexedDocumentsUseCase.execute(limit);
    }

    async deleteIndexedDocument(options: { projectId?: string, sourceFile?: string }) {
        return this.deleteIndexedDocumentUseCase.execute(options);
    }

    async recordFailedIndexing(data: Pick<IndexedDocumentRecord, 'projectId' | 'userId' | 'sourceFile' | 'fileSize' | 'type' | 'errorMessage'>) {
        return this.indexDocumentUseCase.recordFailed(data);
    }
}
