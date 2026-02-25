
import { inject, injectable } from "tsyringe";
import type { IAgentRepository, Agent } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";

@injectable()
export class SaveAgentUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(id: string, agentData: any): Promise<Agent> {
        return this.agentRepository.save(id, agentData);
    }
}
