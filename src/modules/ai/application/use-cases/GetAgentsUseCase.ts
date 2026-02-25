
import { inject, injectable } from "tsyringe";
import type { IAgentRepository, Agent } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";

@injectable()
export class GetAgentsUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(filters?: { category?: string, enabledOnly?: boolean }): Promise<Agent[]> {
        return this.agentRepository.getAll(filters);
    }
}
