
import { inject, injectable } from "tsyringe";
import type { IAiService } from "../../domain/services/IAiService";
import { IAiServiceToken } from "../../domain/services/IAiService";
import type { IGenerationLogRepository } from "../../domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../domain/repositories/IGenerationLogRepository";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";
import { WritingToolRegistry } from "../services/WritingToolRegistry";

export interface RunAiToolInput<TInput> {
    userId: string;
    toolName: string;
    input: TInput;
}

@injectable()
export class RunAiToolUseCase {
    constructor(
        @inject(IAiServiceToken)
        private aiService: IAiService,
        @inject(IGenerationLogRepositoryToken)
        private generationLogRepository: IGenerationLogRepository,
        @inject(DeductCreditsUseCase) private deductCreditsUseCase: DeductCreditsUseCase,
        private writingToolRegistry: WritingToolRegistry
    ) {}

    async execute<TInput, TOutput>(params: RunAiToolInput<TInput>): Promise<TOutput> {
        const { userId, toolName, input } = params;

        const config = this.writingToolRegistry.getTool(toolName);
        if (!config) {
            throw new Error(`Tool ${toolName} not found in registry.`);
        }

        const { flow, creditCost } = config;

        // 1. Run the AI Flow
        const result = await this.aiService.runFlow(flow, input, toolName);

        // 2. Deduct credits
        await this.deductCreditsUseCase.execute(userId, creditCost);

        // 3. Log the generation
        await this.generationLogRepository.log({
            agentId: toolName,
            userId: userId,
            input: input,
            output: result,
            creditCost: creditCost
        });

        return result;
    }
}
