
import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagIndexingOptions, RagIndexingResult } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import type { IIndexedDocumentRepository } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

export interface RecordFailedIndexingInput {
    projectId: string;
    userId?: string;
    sourceFile: string;
    fileSize: number;
    type: 'report' | 'reference' | 'context' | 'user_upload';
    errorMessage?: string;
}

@injectable()
export class IndexDocumentUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository,
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository
    ) {}

    async execute(content: string, options: RagIndexingOptions): Promise<Result<RagIndexingResult, RagError>> {
        // 1. Index
        const result = await this.ragRepository.indexDocument(content, options);
        
        if (result.isSuccess) {
            const data = result.getValue();
            // 2. Track the successful indexing
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
            return Result.ok(data);
        } else {
            // 3. Log failure to db as well
            const errorMsg = result.error?.message || "Unknown indexing error";
            await this.documentRepository.recordFailed({
                projectId: options.projectId || 'unknown',
                userId: options.userId,
                sourceFile: options.sourceFile || 'unknown',
                fileSize: content.length,
                type: options.type ?? 'context',
                errorMessage: errorMsg,
                chunkSize: options.chunkSize || 500,
                overlap: options.overlap || 50,
            });
            return Result.fail(RagError.internal(`Indexing failed: ${errorMsg}`));
        }
    }

    async recordFailed(data: RecordFailedIndexingInput): Promise<Result<string, RagError>> {
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
