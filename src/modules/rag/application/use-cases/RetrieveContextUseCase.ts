
import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagRetrievalOptions, RagRetrievalResult } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/lib/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class RetrieveContextUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(query: string, options: RagRetrievalOptions): Promise<Result<RagRetrievalResult, RagError>> {
        return this.ragRepository.retrieveContext(query, options);
    }
}
