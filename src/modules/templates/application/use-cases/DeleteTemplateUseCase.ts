import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";

@injectable()
export class DeleteTemplateUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: TemplateType, id: string): Promise<void> {
        return this.templateRepository.delete(type, id);
    }
}
