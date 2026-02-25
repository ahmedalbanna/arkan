
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagRetrievalOptions, RagRetrievalResult } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";

@injectable()
export class RetrieveContextUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(query: string, options: RagRetrievalOptions): Promise<RagRetrievalResult> {
        return this.ragRepository.retrieveContext(query, options);
    }
}
