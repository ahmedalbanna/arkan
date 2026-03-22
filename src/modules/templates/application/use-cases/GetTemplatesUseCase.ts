import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, Template, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";
import { Result } from "@/lib/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";

@injectable()
export class GetTemplatesUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: TemplateType): Promise<Result<Template[], TemplateError>> {
        return this.templateRepository.getAll(type);
    }
}
