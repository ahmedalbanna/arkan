
import { delay, inject, injectable } from "tsyringe";
import { RetrieveContextUseCase } from "../../application/use-cases/RetrieveContextUseCase";
import { IndexDocumentUseCase } from "../../application/use-cases/IndexDocumentUseCase";
import { GetRagStatsUseCase } from "../../application/use-cases/GetRagStatsUseCase";

@injectable()
export class RagController {
    constructor(
        @inject(delay(() => RetrieveContextUseCase))
        private retrieveContextUseCase: RetrieveContextUseCase,
        @inject(delay(() => IndexDocumentUseCase))
        private indexDocumentUseCase: IndexDocumentUseCase,
        @inject(delay(() => GetRagStatsUseCase))
        private getRagStatsUseCase: GetRagStatsUseCase
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
}
