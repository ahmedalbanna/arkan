
import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagRetrievalOptions, RagRetrievalResult } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class RetrieveContextUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(query: string, options: RagRetrievalOptions): Promise<Result<RagRetrievalResult, RagError>> {
        const result = await this.ragRepository.retrieveContext(query, options);
        if (result.isFailure) {
            return Result.fail(RagError.internal(`Retrieval failed: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
