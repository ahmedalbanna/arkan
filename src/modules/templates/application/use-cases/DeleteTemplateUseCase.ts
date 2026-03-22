import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";
import { Result } from "@/lib/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";

@injectable()
export class DeleteTemplateUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: TemplateType, id: string): Promise<Result<void, TemplateError>> {
        return this.templateRepository.delete(type, id);
    }
}
