
import { inject, injectable } from "tsyringe";
import type { IRagRepository } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import type { IIndexedDocumentRepository } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";

@injectable()
export class GetRagStatsUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository,
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository
    ) {}

    async execute(): Promise<any> {
        const ragStats = await this.ragRepository.getStats();
        const docStats = await this.documentRepository.getStats();
        
        return {
            totalChunks: ragStats.totalChunks,
            documents: {
                total: docStats.totalDocuments,
                chunks: docStats.totalChunks,
                projects: docStats.projectCount,
                recent: docStats.recentUploads,
            },
            timestamp: new Date().toISOString(),
        };
    }
}
