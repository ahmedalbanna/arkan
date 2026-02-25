
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagIndexingOptions, RagIndexingResult } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";

@injectable()
export class IndexDocumentUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(content: string, options: RagIndexingOptions): Promise<RagIndexingResult> {
        return this.ragRepository.indexDocument(content, options);
    }
}
