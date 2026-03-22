
import { inject, injectable } from "tsyringe";
import type { IAiService } from "../../domain/services/IAiService";
import { IAiServiceToken } from "../../domain/services/IAiService";
import type { IGenerationLogRepository } from "../../domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../domain/repositories/IGenerationLogRepository";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";
import { WritingToolRegistry } from "../services/WritingToolRegistry";
import { Result } from "@/lib/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

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

    async execute<TInput, TOutput>(params: RunAiToolInput<TInput>): Promise<Result<TOutput, AiError>> {
        const { userId, toolName, input } = params;

        const config = this.writingToolRegistry.getTool(toolName);
        if (!config) {
            return Result.fail(AiError.notFound(`Tool ${toolName} not found in registry.`));
        }

        const { flow, creditCost } = config;

        // 1. Run the AI Flow
        const aiResult = await this.aiService.runFlow<TInput, TOutput>(flow, input, toolName);
        if (aiResult.isFailure) {
            return aiResult;
        }

        const result = aiResult.getValue();

        // 2. Deduct credits
        const deductResult = await this.deductCreditsUseCase.execute(userId, creditCost);
        if (deductResult.isFailure) {
            // If credit deduction fails, we still return the AI result but maybe log the error?
            // Actually, in a strict system we should have checked credits first.
            // For now, we propagate the error if we want to enforce credit rules.
            return Result.fail(AiError.internal(`Credit deduction failed: ${deductResult.error?.message}`));
        }

        // 3. Log the generation
        await this.generationLogRepository.log({
            agentId: toolName,
            userId: userId,
            input: input,
            output: result,
            creditCost: creditCost
        });

        return Result.ok(result);
    }
}
