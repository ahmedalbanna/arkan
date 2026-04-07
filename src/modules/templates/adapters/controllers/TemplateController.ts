
import { delay, inject, injectable } from "tsyringe";
import { GetTemplatesUseCase } from "../../application/use-cases/GetTemplatesUseCase";
import { GetTemplateByIdUseCase } from "../../application/use-cases/GetTemplateByIdUseCase";
import { SaveTemplateUseCase } from "../../application/use-cases/SaveTemplateUseCase";
import { DeleteTemplateUseCase } from "../../application/use-cases/DeleteTemplateUseCase";
import { type Template, type TemplateType } from "../../domain/repositories/ITemplateRepository";
import { Result } from "@/infrastructure/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";

@injectable()
export class TemplateController {
    constructor(
        @inject(delay(() => GetTemplatesUseCase))
        private getTemplatesUseCase: GetTemplatesUseCase,
        @inject(delay(() => GetTemplateByIdUseCase))
        private getTemplateByIdUseCase: GetTemplateByIdUseCase,
        @inject(delay(() => SaveTemplateUseCase))
        private saveTemplateUseCase: SaveTemplateUseCase,
        @inject(delay(() => DeleteTemplateUseCase))
        private deleteTemplateUseCase: DeleteTemplateUseCase
    ) {}

    async getTemplates(type: TemplateType): Promise<Result<Template[], TemplateError>> {
        return this.getTemplatesUseCase.execute(type);
    }

    async getTemplateById(type: TemplateType, id: string): Promise<Result<Template, TemplateError>> {
        return this.getTemplateByIdUseCase.execute(type, id);
    }

    async saveTemplate(type: TemplateType, data: Partial<Template> & { id: string }): Promise<Result<Template, TemplateError>> {
        return this.saveTemplateUseCase.execute(type, data as Template);
    }

    async deleteTemplate(type: TemplateType, id: string): Promise<Result<void, TemplateError>> {
        return this.deleteTemplateUseCase.execute(type, id);
    }
}
