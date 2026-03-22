
import { inject, injectable } from "tsyringe";
import type { IIndexedDocumentRepository } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";
import type { IRagRepository } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/lib/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class DeleteIndexedDocumentUseCase {
    constructor(
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository,
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(options: { projectId?: string, sourceFile?: string }): Promise<Result<void, RagError>> {
        if (options.projectId) {
            return this.documentRepository.deleteByProjectId(options.projectId);
        } else if (options.sourceFile) {
            return this.documentRepository.deleteBySourceFile(options.sourceFile);
        }
        return Result.ok();
    }
}
