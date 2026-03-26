import { inject, injectable } from "tsyringe";
import type { IRagRepository } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class ClearRagCacheUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(): Promise<Result<void, RagError>> {
        return this.ragRepository.clearCache();
    }
}
