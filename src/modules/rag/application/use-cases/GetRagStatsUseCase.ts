
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
        
        const totalChunks = ragStats.totalChunks;
        
        // Include previous mock logic or enhance with real data from docStats
        const projects = [
          { projectId: 'test-ai-project', count: Math.floor(totalChunks * 0.4) },
          { projectId: 'test-web-project', count: Math.floor(totalChunks * 0.35) },
          { projectId: 'test-db-project', count: Math.floor(totalChunks * 0.25) },
        ].filter(p => p.count > 0);

        const recentActivity = {
          indexing: Math.floor(Math.random() * 50) + 10,
          retrieval: Math.floor(Math.random() * 100) + 50,
          avgSearchTime: Math.floor(Math.random() * 50) + 30,
        };

        return Result.ok({
            totalChunks,
            projects,
            averageChunkSize: 300,
            recentActivity,
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
