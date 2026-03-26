
import { inject, injectable } from "tsyringe";
import type { IRagRepository } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import type { IIndexedDocumentRepository } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class GetRagStatsUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository,
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository
    ) {}

    async execute(): Promise<Result<any, RagError>> {
        const ragStatsResult = await this.ragRepository.getStats();
        if (ragStatsResult.isFailure) return ragStatsResult as any;

        const docStatsResult = await this.documentRepository.getStats();
        if (docStatsResult.isFailure) return docStatsResult as any;

        const ragStats = ragStatsResult.getValue();
        const docStats = docStatsResult.getValue();
        
        return Result.ok({
            totalChunks: ragStats.totalChunks,
            documents: {
                total: docStats.totalDocuments,
                chunks: docStats.totalChunks,
                projects: docStats.projectCount,
                recent: docStats.recentUploads,
            },
            timestamp: new Date().toISOString(),
        });
    }
}
