
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

export interface ITemplateRepository {
    getAll(type: TemplateType): Promise<Template[]>;
    getById(type: TemplateType, id: string): Promise<Template | null>;
    save(type: TemplateType, data: Template): Promise<Template>;
    delete(type: TemplateType, id: string): Promise<void>;
}

export const ITemplateRepositoryToken = Symbol("ITemplateRepository");
