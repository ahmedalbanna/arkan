import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, Template } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";

@injectable()
export class GetTemplatesUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: 'docx' | 'pptx'): Promise<Template[]> {
        return this.templateRepository.getAll(type);
    }
}
