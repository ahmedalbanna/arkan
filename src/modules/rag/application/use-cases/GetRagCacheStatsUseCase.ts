import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagCacheStats } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class GetRagCacheStatsUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(): Promise<Result<RagCacheStats, RagError>> {
        return this.ragRepository.getCacheStats();
    }
}
