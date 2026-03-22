
import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagIndexingOptions, RagIndexingResult } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import type { IIndexedDocumentRepository, IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";
import { Result } from "@/lib/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class IndexDocumentUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository,
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository
    ) {}

    async execute(content: string, options: RagIndexingOptions): Promise<Result<RagIndexingResult, RagError>> {
        const result = await this.ragRepository.indexDocument(content, options);
        
        if (result.isSuccess) {
            const data = result.getValue();
            // Track the successful indexing
            await this.documentRepository.record({
                projectId: options.projectId || 'unknown',
                userId: options.userId,
                sourceFile: options.sourceFile || 'unknown',
                chunksCount: data.chunksCreated,
                fileSize: content.length, // approximation
                type: options.type ?? 'context',
                chunkSize: options.chunkSize || 500,
                overlap: options.overlap || 50,
            });
        } else {
            // Log failure to db as well
            await this.documentRepository.recordFailed({
                projectId: options.projectId || 'unknown',
                userId: options.userId,
                sourceFile: options.sourceFile || 'unknown',
                fileSize: content.length,
                type: options.type ?? 'context',
                errorMessage: result.error?.message || "Unknown indexing error",
                chunkSize: options.chunkSize || 500,
                overlap: options.overlap || 50,
            });
        }

        return result;
    }

    async recordFailed(data: Pick<IndexedDocumentRecord, 'projectId' | 'userId' | 'sourceFile' | 'fileSize' | 'type' | 'errorMessage'>): Promise<Result<string, RagError>> {
        return this.documentRepository.recordFailed({
            projectId: data.projectId,
            userId: data.userId,
            sourceFile: data.sourceFile,
            fileSize: data.fileSize,
            type: data.type,
            errorMessage: data.errorMessage,
            chunkSize: 0,
            overlap: 0,
        });
    }
}
