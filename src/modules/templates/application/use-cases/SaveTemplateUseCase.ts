import { inject, injectable } from "tsyringe";
import type { ITemplateRepository, Template, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { ITemplateRepositoryToken } from "../../domain/repositories/ITemplateRepository";
import { Result } from "@/infrastructure/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";
import { createDocxTemplateSchema, createPptxTemplateSchema } from "@/modules/users/domain/schemas/index";

@injectable()
export class SaveTemplateUseCase {
    constructor(
        @inject(ITemplateRepositoryToken)
        private templateRepository: ITemplateRepository
    ) {}

    async execute(type: TemplateType, data: Template): Promise<Result<Template, TemplateError>> {
        // 1. Validate
        const schema = type === 'docx' ? createDocxTemplateSchema : createPptxTemplateSchema;
        const validation = schema.safeParse(data);
        if (!validation.success) {
            return Result.fail(TemplateError.validation(`Validation failed: ${validation.error.message}`));
        }

        // 2. Persist
        const result = await this.templateRepository.save(type, data);
        if (result.isFailure) {
            return Result.fail(TemplateError.saveError(`Failed to save template: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
