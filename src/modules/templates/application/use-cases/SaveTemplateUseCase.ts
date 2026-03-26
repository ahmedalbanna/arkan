import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, Template, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";
import { Result } from "@/infrastructure/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";

@injectable()
export class SaveTemplateUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: TemplateType, data: Template): Promise<Result<Template, TemplateError>> {
        return this.templateRepository.save(type, data);
    }
}
