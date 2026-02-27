
import { inject, injectable } from "tsyringe";
import type { IIndexedDocumentRepository } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";
import type { IRagRepository } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";

@injectable()
export class DeleteIndexedDocumentUseCase {
    constructor(
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository,
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(options: { projectId?: string, sourceFile?: string }): Promise<void> {
        if (options.projectId) {
            await this.documentRepository.deleteByProjectId(options.projectId);
            // Also delete from vector store via RAG repository if it supports it
            // For now, we assume the tracking is enough or handled by RAG repo
        } else if (options.sourceFile) {
            await this.documentRepository.deleteBySourceFile(options.sourceFile);
        }
    }
}
