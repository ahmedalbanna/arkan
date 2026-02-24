
import { inject, injectable } from "tsyringe";
import { IAiService, IAiServiceToken } from "../../domain/services/IAiService";
import { IGenerationLogRepository, IGenerationLogRepositoryToken } from "../../domain/repositories/IGenerationLogRepository";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";

export interface RunAiToolInput<TInput> {
    userId: string;
    toolName: string;
    input: TInput;
    flow: (input: TInput) => Promise<any>;
    creditCost: number;
}

@injectable()
export class RunAiToolUseCase {
    constructor(
        @inject(IAiServiceToken)
        private aiService: IAiService,
        @inject(IGenerationLogRepositoryToken)
        private generationLogRepository: IGenerationLogRepository,
        private deductCreditsUseCase: DeductCreditsUseCase
    ) {}

    async execute<TInput, TOutput>(params: RunAiToolInput<TInput>): Promise<TOutput> {
        const { userId, toolName, input, flow, creditCost } = params;

        // 1. Run the AI Flow
        const result = await this.aiService.runFlow(flow, input);

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
