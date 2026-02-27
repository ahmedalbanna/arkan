
import { delay, inject, injectable } from "tsyringe";
import { GetTemplatesUseCase } from "../../application/use-cases/GetTemplatesUseCase";
import { GetTemplateByIdUseCase } from "../../application/use-cases/GetTemplateByIdUseCase";
import { SaveTemplateUseCase } from "../../application/use-cases/SaveTemplateUseCase";
import { DeleteTemplateUseCase } from "../../application/use-cases/DeleteTemplateUseCase";
import { TemplateType } from "../../domain/repositories/ITemplateRepository";

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

    async getTemplates(type: TemplateType) {
        return this.getTemplatesUseCase.execute(type);
    }

    async getTemplateById(type: TemplateType, id: string) {
        return this.getTemplateByIdUseCase.execute(type, id);
    }

    async saveTemplate(type: TemplateType, data: any) {
        return this.saveTemplateUseCase.execute(type, data);
    }

    async deleteTemplate(type: TemplateType, id: string) {
        return this.deleteTemplateUseCase.execute(type, id);
    }
}
