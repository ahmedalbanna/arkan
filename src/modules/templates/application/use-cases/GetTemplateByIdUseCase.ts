import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, Template } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";

@injectable()
export class GetTemplateByIdUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: 'docx' | 'pptx', id: string): Promise<Template | null> {
        return this.templateRepository.getById(type, id);
    }
}
