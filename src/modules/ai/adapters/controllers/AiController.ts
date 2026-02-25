
import "reflect-metadata";
import { injectable } from "tsyringe";
import { RunAiToolUseCase, RunAiToolInput } from "../../application/use-cases/RunAiToolUseCase";
import { GetAgentsUseCase } from "../../application/use-cases/GetAgentsUseCase";
import { GetAgentByIdUseCase } from "../../application/use-cases/GetAgentByIdUseCase";
import { SaveAgentUseCase } from "../../application/use-cases/SaveAgentUseCase";
import { DeleteAgentUseCase } from "../../application/use-cases/DeleteAgentUseCase";

@injectable()
export class AiController {
    constructor(
        private runAiToolUseCase: RunAiToolUseCase,
        private getAgentsUseCase: GetAgentsUseCase,
        private getAgentByIdUseCase: GetAgentByIdUseCase,
        private saveAgentUseCase: SaveAgentUseCase,
        private deleteAgentUseCase: DeleteAgentUseCase
    ) {}

    async runTool<TInput, TOutput>(params: RunAiToolInput<TInput>): Promise<TOutput> {
        return this.runAiToolUseCase.execute<TInput, TOutput>(params);
    }

    async getAgents(filters?: { category?: string, enabledOnly?: boolean }) {
        return this.getAgentsUseCase.execute(filters);
    }

    async getAgentById(id: string) {
        return this.getAgentByIdUseCase.execute(id);
    }

    async saveAgent(id: string, data: any) {
        return this.saveAgentUseCase.execute(id, data);
    }

    async deleteAgent(id: string) {
        return this.deleteAgentUseCase.execute(id);
    }
}
