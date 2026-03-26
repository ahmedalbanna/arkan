
import { inject, injectable } from "tsyringe";
import type { IIndexedDocumentRepository, IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class GetIndexedDocumentsUseCase {
    constructor(
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository
    ) {}

    async execute(limit?: number): Promise<Result<IndexedDocumentRecord[], RagError>> {
        return this.documentRepository.getAll(limit);
    }
}
