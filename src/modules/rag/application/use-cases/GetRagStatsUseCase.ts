
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { IRagRepository } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";

@injectable()
export class GetRagStatsUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(): Promise<{ totalChunks: number }> {
        return this.ragRepository.getStats();
    }
}
