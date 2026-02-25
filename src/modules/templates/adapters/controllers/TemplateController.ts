
import "reflect-metadata";
import { injectable } from "tsyringe";
import { GetTemplatesUseCase } from "../../application/use-cases/GetTemplatesUseCase";
import { GetTemplateByIdUseCase } from "../../application/use-cases/GetTemplateByIdUseCase";
import { SaveTemplateUseCase } from "../../application/use-cases/SaveTemplateUseCase";
import { DeleteTemplateUseCase } from "../../application/use-cases/DeleteTemplateUseCase";

@injectable()
export class TemplateController {
    constructor(
        private getTemplatesUseCase: GetTemplatesUseCase,
        private getTemplateByIdUseCase: GetTemplateByIdUseCase,
        private saveTemplateUseCase: SaveTemplateUseCase,
        private deleteTemplateUseCase: DeleteTemplateUseCase
    ) {}

    async getTemplates(type: 'docx' | 'pptx') {
        return this.getTemplatesUseCase.execute(type);
    }

    async getTemplateById(type: 'docx' | 'pptx', id: string) {
        return this.getTemplateByIdUseCase.execute(type, id);
    }

    async saveTemplate(type: 'docx' | 'pptx', data: any) {
        return this.saveTemplateUseCase.execute(type, data);
    }

    async deleteTemplate(type: 'docx' | 'pptx', id: string) {
        return this.deleteTemplateUseCase.execute(type, id);
    }
}
