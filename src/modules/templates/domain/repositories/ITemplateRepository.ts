
export interface Template {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    dataAiHint?: string;
    styles?: any;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type TemplateType = 'docx' | 'pptx' | 'report' | 'presentation';

import { Result } from "@/lib/utils/result";
import { TemplateError } from "../errors/TemplateErrors";

export interface ITemplateRepository {
    getAll(type: TemplateType): Promise<Result<Template[], TemplateError>>;
    getById(type: TemplateType, id: string): Promise<Result<Template, TemplateError>>;
    save(type: TemplateType, data: Template): Promise<Result<Template, TemplateError>>;
    delete(type: TemplateType, id: string): Promise<Result<void, TemplateError>>;
}

export const ITemplateRepositoryToken = Symbol("ITemplateRepository");
