
import { inject, injectable } from "tsyringe";
import type { IAiService } from "../../domain/services/IAiService";
import { IAiServiceToken } from "../../domain/services/IAiService";
import type { IGenerationLogRepository } from "../../domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../domain/repositories/IGenerationLogRepository";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";
import { WritingToolRegistry } from "../services/WritingToolRegistry";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";
import { rateLimiter } from "@/infrastructure/security/rate-limiter";

export interface RunAiToolInput<TInput> {
    userId: string;
    toolName: string;
    input: TInput;
    ip?: string;
}

@injectable()
export class RunAiToolUseCase {
    constructor(
        @inject(IAiServiceToken)
        private aiService: IAiService,
        @inject(IGenerationLogRepositoryToken)
        private generationLogRepository: IGenerationLogRepository,
        @inject(DeductCreditsUseCase) private deductCreditsUseCase: DeductCreditsUseCase,
        @inject(WritingToolRegistry)
        private writingToolRegistry: WritingToolRegistry
    ) {}

    async execute<TInput, TOutput>(params: RunAiToolInput<TInput>): Promise<Result<TOutput, AiError>> {
        const { userId, toolName, input, ip } = params;

        const config = this.writingToolRegistry.getTool(toolName);
        if (!config) {
            return Result.fail(AiError.notFound(`Tool ${toolName} not found in registry.`));
        }

        const { flow, creditCost, isFreeForGuests } = config;

        // 1. Handle guest access
        const isGuest = userId === 'guest';
        if (isGuest) {
            if (!isFreeForGuests) {
                return Result.fail(AiError.unauthorized(`The ${toolName} tool requires a registered account.`));
            }

            // Apply daily limit for guests (5 requests per 24h)
            const limiterResult = await rateLimiter.check('guest-writing-tools', ip || 'unknown', 5, 24 * 60 * 60 * 1000);
            if (!limiterResult.allowed) {
                return Result.fail(AiError.unauthorized("Guest daily limit exceeded (5 requests/day). Please sign up for unlimited access."));
            }
        }

        // 2. Pre-deduct credits or check free tier for registered users
        let creditsDeducted = false;
        let isFreeTierRegistered = false;

        if (!isGuest && creditCost > 0) {
            const deductResult = await this.deductCreditsUseCase.execute(userId, creditCost);
            
            if (deductResult.isFailure) {
                // Check if they can use the free registered tier (10 generations/day)
                if (isFreeForGuests) {
                    const limiterResult = await rateLimiter.check('registered-free-tier', userId, 10, 24 * 60 * 60 * 1000);
                    if (!limiterResult.allowed) {
                        return Result.fail(AiError.unauthorized("Daily free tier limit exceeded (10 generations/day). Please top up your credits."));
                    }
                    isFreeTierRegistered = true;
                } else {
                    return Result.fail(AiError.internal(`Insufficient credits and tool is not free tier compatible.`));
                }
            } else {
                creditsDeducted = true;
            }
        }

        // 3. Run the AI Flow
        try {
            const aiResult = await this.aiService.runFlow<TInput, TOutput>(flow, input, toolName);
            
            if (aiResult.isFailure) {
                // Refund credits if AI flow fails
                if (creditsDeducted) {
                    await this.deductCreditsUseCase.execute(userId, -creditCost);
                }
                return aiResult;
            }

            const result = aiResult.getValue();

            // 4. Log the generation
            await this.generationLogRepository.log({
                agentId: toolName,
                userId: userId,
                input: input,
                output: result,
                creditCost: (isGuest || isFreeTierRegistered) ? 0 : creditCost
            });

            // 5. Wrap response with usage metadata
            const usage = isGuest 
                ? await rateLimiter.getStats('guest-writing-tools', ip || 'unknown', 5, 24 * 60 * 60 * 1000)
                : isFreeTierRegistered 
                    ? await rateLimiter.getStats('registered-free-tier', userId, 10, 24 * 60 * 60 * 1000)
                    : null;

            return Result.ok({
                ...(result as any),
                usageMetadata: usage
            } as any);
        } catch (error: any) {
            // Refund credits on unexpected error
            if (creditsDeducted) {
                await this.deductCreditsUseCase.execute(userId, -creditCost);
            }
            return Result.fail(AiError.internal(error.message));
        }
    }
}
