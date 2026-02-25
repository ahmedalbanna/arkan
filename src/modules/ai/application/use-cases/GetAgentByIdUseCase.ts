
import { inject, injectable } from "tsyringe";
import type { IAgentRepository, Agent } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";

@injectable()
export class GetAgentByIdUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(id: string): Promise<Agent | null> {
        return this.agentRepository.getById(id);
    }
}
