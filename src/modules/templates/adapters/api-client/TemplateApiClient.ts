
import { apiService } from "@/services/api/apiService";
import type { 
  Template, 
  DocxTemplate, 
  PptxTemplate, 
  ReportTemplate 
} from "../../domain/entities/Template";

export class TemplateApiClient {
    async fetchDocxTemplates(token?: string): Promise<DocxTemplate[]> {
        return apiService({ endpoint: '/api/templates/docx', token });
    }

    async fetchPptxTemplates(token?: string): Promise<PptxTemplate[]> {
        return apiService({ endpoint: '/api/templates/pptx', token });
    }

    async fetchReportTemplates(token?: string): Promise<ReportTemplate[]> {
        return apiService({ endpoint: '/api/templates/report', token });
    }

    async saveTemplate(type: 'docx' | 'pptx' | 'report', data: any, token: string): Promise<any> {
        return apiService({
            endpoint: `/api/templates/${type}`,
            method: 'POST',
            data,
            token
        });
    }

    async deleteTemplate(type: 'docx' | 'pptx' | 'report', id: string, token: string): Promise<{ message: string }> {
        return apiService({
            endpoint: `/api/templates/${type}/${id}`,
            method: 'DELETE',
            token
        });
    }
}
