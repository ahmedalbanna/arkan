import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagHealthStatus } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/lib/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class GetRagHealthStatusUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(): Promise<Result<RagHealthStatus, RagError>> {
        return this.ragRepository.getHealthStatus();
    }
}
