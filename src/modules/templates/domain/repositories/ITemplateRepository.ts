
export interface Template {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    dataAiHint?: string;
    styles?: any;
    createdAt?: string;
    updatedAt?: string;
}

export interface ITemplateRepository {
    getAll(type: 'docx' | 'pptx'): Promise<Template[]>;
    getById(type: 'docx' | 'pptx', id: string): Promise<Template | null>;
    save(type: 'docx' | 'pptx', data: Template): Promise<Template>;
    delete(type: 'docx' | 'pptx', id: string): Promise<void>;
}

export const ITemplateRepositoryToken = Symbol("ITemplateRepository");
