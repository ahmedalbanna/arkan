
import { inject, injectable } from "tsyringe";
import type { IAgentRepository } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";

@injectable()
export class DeleteAgentUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(id: string): Promise<void> {
        return this.agentRepository.delete(id);
    }
}
