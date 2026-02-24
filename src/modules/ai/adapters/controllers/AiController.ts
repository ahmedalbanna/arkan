
import { injectable } from "tsyringe";
import { RunAiToolUseCase, RunAiToolInput } from "../../application/use-cases/RunAiToolUseCase";

@injectable()
export class AiController {
    constructor(
        private runAiToolUseCase: RunAiToolUseCase
    ) {}

    async runTool<TInput, TOutput>(params: RunAiToolInput<TInput>): Promise<TOutput> {
        return this.runAiToolUseCase.execute<TInput, TOutput>(params);
    }
}
