import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagSearchCacheLookupOptions } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class CheckRagSearchCacheHitUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(query: string, options?: RagSearchCacheLookupOptions): Promise<Result<boolean, RagError>> {
        return this.ragRepository.isSearchCacheHit(query, options);
    }
}
