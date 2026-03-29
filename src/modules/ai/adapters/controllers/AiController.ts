
import { delay, inject, injectable } from "tsyringe";
import { RunAiToolUseCase, RunAiToolInput } from "../../application/use-cases/RunAiToolUseCase";
import { GetAgentsUseCase } from "../../application/use-cases/GetAgentsUseCase";
import { GetAgentByIdUseCase } from "../../application/use-cases/GetAgentByIdUseCase";
import { SaveAgentUseCase } from "../../application/use-cases/SaveAgentUseCase";
import { DeleteAgentUseCase } from "../../application/use-cases/DeleteAgentUseCase";
import { GetAgentCategoriesUseCase } from "../../application/use-cases/GetAgentCategoriesUseCase";
import { GenerateChapterWithRAGUseCase } from "../../application/use-cases/GenerateChapterWithRAGUseCase";
import { GenerateSectionWithRAGUseCase } from "../../application/use-cases/GenerateSectionWithRAGUseCase";
import { WritingToolRegistry } from "../../application/services/WritingToolRegistry";

@injectable()
export class AiController {
    constructor(
        @inject(delay(() => RunAiToolUseCase))
        private runAiToolUseCase: RunAiToolUseCase,
        @inject(delay(() => GetAgentsUseCase))
        private getAgentsUseCase: GetAgentsUseCase,
        @inject(delay(() => GetAgentByIdUseCase))
        private getAgentByIdUseCase: GetAgentByIdUseCase,
        @inject(delay(() => SaveAgentUseCase))
        private saveAgentUseCase: SaveAgentUseCase,
        @inject(delay(() => DeleteAgentUseCase))
        private deleteAgentUseCase: DeleteAgentUseCase,
        @inject(delay(() => GetAgentCategoriesUseCase))
        private getAgentCategoriesUseCase: GetAgentCategoriesUseCase,
        @inject(delay(() => GenerateChapterWithRAGUseCase))
        private generateChapterWithRAGUseCase: GenerateChapterWithRAGUseCase,
        @inject(delay(() => GenerateSectionWithRAGUseCase))
        private generateSectionWithRAGUseCase: GenerateSectionWithRAGUseCase,
        @inject(delay(() => WritingToolRegistry))
        private writingToolRegistry: WritingToolRegistry
    ) {}

    getToolConfig(name: string) {
        return this.writingToolRegistry.getTool(name);
    }

    async runTool<TInput, TOutput>(params: { userId: string, toolName: string, input: TInput, ip?: string }) {
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

    async getAgentCategories() {
        return this.getAgentCategoriesUseCase.execute();
    }

    async generateChapterWithRAG(userId: string, input: any) {
        return this.generateChapterWithRAGUseCase.execute(userId, input);
    }

    async generateSectionWithRAG(userId: string, input: any) {
        return this.generateSectionWithRAGUseCase.execute(userId, input);
    }
}
