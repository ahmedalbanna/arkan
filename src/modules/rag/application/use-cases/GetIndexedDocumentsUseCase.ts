
import { inject, injectable } from "tsyringe";
import type { IIndexedDocumentRepository, IndexedDocumentRecord } from "../../domain/repositories/IIndexedDocumentRepository";
import { IIndexedDocumentRepositoryToken } from "../../domain/repositories/IIndexedDocumentRepository";

@injectable()
export class GetIndexedDocumentsUseCase {
    constructor(
        @inject(IIndexedDocumentRepositoryToken)
        private documentRepository: IIndexedDocumentRepository
    ) {}

    async execute(limit?: number): Promise<IndexedDocumentRecord[]> {
        return this.documentRepository.getAll(limit);
    }
}
