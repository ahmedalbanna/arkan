
import { delay, inject, injectable } from "tsyringe";
import { RetrieveContextUseCase } from "../../application/use-cases/RetrieveContextUseCase";
import { IndexDocumentUseCase } from "../../application/use-cases/IndexDocumentUseCase";
import { GetRagStatsUseCase } from "../../application/use-cases/GetRagStatsUseCase";
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
        @inject(delay(() => GetIndexedDocumentsUseCase))
        private getIndexedDocumentsUseCase: GetIndexedDocumentsUseCase,
        @inject(delay(() => DeleteIndexedDocumentUseCase))
        private deleteIndexedDocumentUseCase: DeleteIndexedDocumentUseCase
    ) {}

    async retrieveContext(query: string, options: any) {
        return this.retrieveContextUseCase.execute(query, options);
    }

    async indexDocument(content: string, options: any) {
        return this.indexDocumentUseCase.execute(content, options);
    }

    async getStats() {
        return this.getRagStatsUseCase.execute();
    }

    async getIndexedDocuments(limit?: number) {
        return this.getIndexedDocumentsUseCase.execute(limit);
    }

    async deleteIndexedDocument(options: { projectId?: string, sourceFile?: string }) {
        return this.deleteIndexedDocumentUseCase.execute(options);
    }

    async recordFailedIndexing(data: any) {
        return this.indexDocumentUseCase.recordFailed(data);
    }
}
