import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";

@injectable()
export class DeleteTemplateUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: 'docx' | 'pptx', id: string): Promise<void> {
        return this.templateRepository.delete(type, id);
    }
}
