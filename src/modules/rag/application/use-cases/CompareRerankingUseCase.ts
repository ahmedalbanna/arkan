import { inject, injectable } from "tsyringe";
import type { IRagRepository, RagRerankComparisonResult, RagRerankStrategy } from "../../domain/repositories/IRagRepository";
import { IRagRepositoryToken } from "../../domain/repositories/IRagRepository";
import { Result } from "@/lib/utils/result";
import { RagError } from "../../domain/errors/RagErrors";

@injectable()
export class CompareRerankingUseCase {
    constructor(
        @inject(IRagRepositoryToken)
        private ragRepository: IRagRepository
    ) {}

    async execute(query: string, strategy?: RagRerankStrategy | 'all'): Promise<Result<RagRerankComparisonResult, RagError>> {
        return this.ragRepository.compareReranking(query, strategy);
    }
}
