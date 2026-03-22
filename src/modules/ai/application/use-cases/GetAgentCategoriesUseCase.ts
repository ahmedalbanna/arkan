
import { inject, injectable } from "tsyringe";
import type { IAgentRepository } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";
import { Result } from "@/lib/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class GetAgentCategoriesUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(): Promise<Result<any[], AiError>> {
        return this.agentRepository.getCategories();
    }
}
