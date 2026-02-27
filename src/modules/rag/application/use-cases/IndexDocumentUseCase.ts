
import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagIndexingOptions, RagIndexingResult } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import type { IIndexedDocumentRepository } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";

@injectable()
export class IndexDocumentUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository,
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository
    ) {}

    async execute(content: string, options: RagIndexingOptions): Promise<RagIndexingResult> {
        const result = await this.ragRepository.indexDocument(content, options);
        
        // Track the successful indexing
        await this.documentRepository.record({
            projectId: options.projectId || 'unknown',
            userId: options.userId,
            sourceFile: options.sourceFile || 'unknown',
            chunksCount: result.chunksCount,
            fileSize: content.length, // approximation
            type: options.type as any || 'context',
            chunkSize: options.chunkSize || 500,
            overlap: options.overlap || 50,
        });

        return result;
    }

    async recordFailed(data: { 
        projectId: string, 
        userId?: string, 
        sourceFile: string, 
        fileSize: number, 
        type: any, 
        errorMessage: string 
    }): Promise<void> {
        await this.documentRepository.recordFailed({
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
