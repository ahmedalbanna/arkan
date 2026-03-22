
import { inject, injectable } from "tsyringe";
import type { IAgentRepository } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";
import { Agent } from "../../domain/entities/Agent";
import { Result } from "@/lib/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class GetAgentsUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(filters?: { category?: string, enabledOnly?: boolean }): Promise<Result<Agent[], AiError>> {
        return this.agentRepository.getAll(filters);
    }
}
