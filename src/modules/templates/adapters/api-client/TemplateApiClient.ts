import "reflect-metadata";
import { injectable } from "tsyringe";
import { apiService } from '@/infrastructure/api/ApiService';
import type { DocxTemplateProperties } from '@/modules/templates/domain/entities/DocxTemplate';
import type { PptxTemplateProperties } from '@/modules/templates/domain/entities/PptxTemplate';
import type { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';

@injectable()
export class TemplateApiClient {
  async fetchDocxTemplatesApi() {
    return apiService<undefined, Record<string, DocxTemplateProperties>>({ endpoint: '/api/templates/docx' });
  }

  async updateDocxTemplateApi(key: string, data: Partial<DocxTemplateProperties>, token: string) {
    return apiService({ endpoint: `/api/templates/docx/${key}`, method: 'PUT', data, token });
  }

  async deleteDocxTemplateApi(key: string, token: string) {
    return apiService({ endpoint: `/api/templates/docx/${key}`, method: 'DELETE', token });
  }

  async createDocxTemplateApi(data: { id: string; name: string; description: string }, token: string) {
    return apiService({ endpoint: '/api/templates/docx', method: 'POST', data, token });
  }

  async refreshTemplateImage(data: { templateId: string; prompt: string; templateType: 'docx' | 'pptx' }, token: string) {
    return apiService({ endpoint: '/api/templates/refresh-image', method: 'POST', data, token });
  }

  async fetchPptxTemplatesApi() {
    return apiService<undefined, Record<string, PptxTemplateProperties>>({ endpoint: '/api/templates/pptx' });
  }

  async updatePptxTemplateApi(key: string, data: Partial<PptxTemplateProperties>, token: string) {
    return apiService({ endpoint: `/api/templates/pptx/${key}`, method: 'PUT', data, token });
  }

  async deletePptxTemplateApi(key: string, token: string) {
    return apiService({ endpoint: `/api/templates/pptx/${key}`, method: 'DELETE', token });
  }

  async createPptxTemplateApi(data: { id: string; name: string; description: string }, token: string) {
    return apiService({ endpoint: '/api/templates/pptx', method: 'POST', data, token });
  }

  async fetchReportTemplatesApi(token?: string): Promise<ReportTemplateProperties[]> {
    return apiService({ endpoint: '/api/templates/report', token });
  }

  async createReportTemplateApi(data: Record<string, unknown>, token: string) {
    return apiService({ endpoint: '/api/templates/report', method: 'POST', data, token });
  }

  async updateReportTemplateApi(templateId: string, data: Record<string, unknown>, token: string) {
    return apiService({ endpoint: `/api/templates/report`, method: 'PUT', data: { id: templateId, ...data }, token });
  }

  async deleteReportTemplateApi(templateId: string, token: string) {
    return apiService({ endpoint: `/api/templates/report`, method: 'DELETE', data: { id: templateId }, token });
  }

  async fetchPresentationTemplatesApi(token?: string): Promise<PptxTemplateProperties[]> {
    return apiService({ endpoint: '/api/templates/pptx', token });
  }

  async createPresentationTemplateApi(data: Record<string, unknown>, token: string) {
    return apiService({ endpoint: '/api/templates/pptx', method: 'POST', data, token });
  }

  async updatePresentationTemplateApi(templateId: string, data: Record<string, unknown>, token: string) {
    return apiService({ endpoint: `/api/templates/pptx/${templateId}`, method: 'PUT', data, token });
  }

  async deletePresentationTemplateApi(templateId: string, token: string) {
    return apiService({ endpoint: `/api/templates/pptx/${templateId}`, method: 'DELETE', token });
  }
}
