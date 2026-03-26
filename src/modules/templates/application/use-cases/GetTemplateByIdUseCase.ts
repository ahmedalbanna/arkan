import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, Template, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";
import { Result } from "@/infrastructure/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";

@injectable()
export class GetTemplateByIdUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: TemplateType, id: string): Promise<Result<Template, TemplateError>> {
        return this.templateRepository.getById(type, id);
    }
}
