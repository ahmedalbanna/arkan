import "reflect-metadata";

import { injectable, inject } from "tsyringe";
import { RunAiToolUseCase, RunAiToolInput } from "../../application/use-cases/RunAiToolUseCase";

@injectable()
export class AiController {
    constructor(
        @inject(RunAiToolUseCase) private runAiToolUseCase: RunAiToolUseCase
    ) {}

    async runTool<TInput, TOutput>(params: RunAiToolInput<TInput>): Promise<TOutput> {
        return this.runAiToolUseCase.execute<TInput, TOutput>(params);
    }
}
