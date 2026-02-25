import { apiService } from '@/infrastructure/api/ApiService';
import type { DocxTemplateProperties } from '@/modules/templates/domain/entities/DocxTemplate';
import type { PptxTemplateProperties } from '@/modules/templates/domain/entities/PptxTemplate';
import type { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';

export async function fetchDocxTemplatesApi() {
  return apiService<undefined, Record<string, DocxTemplateProperties>>({ endpoint: '/api/templates/docx' });
}

export async function updateDocxTemplateApi(key: string, data: Partial<DocxTemplateProperties>, token: string) {
  return apiService({ endpoint: `/api/templates/docx/${key}`, method: 'PUT', data, token });
}

export async function deleteDocxTemplateApi(key: string, token: string) {
  return apiService({ endpoint: `/api/templates/docx/${key}`, method: 'DELETE', token });
}

export async function createDocxTemplateApi(data: { id: string; name: string; description: string }, token: string) {
  return apiService({ endpoint: '/api/templates/docx', method: 'POST', data, token });
}

export async function refreshTemplateImage(data: { templateId: string; prompt: string; templateType: 'docx' | 'pptx' }, token: string) {
  return apiService({ endpoint: '/api/templates/refresh-image', method: 'POST', data, token });
}

export async function fetchPptxTemplatesApi() {
  return apiService<undefined, Record<string, PptxTemplateProperties>>({ endpoint: '/api/templates/pptx' });
}

export async function updatePptxTemplateApi(key: string, data: Partial<PptxTemplateProperties>, token: string) {
  return apiService({ endpoint: `/api/templates/pptx/${key}`, method: 'PUT', data, token });
}

export async function deletePptxTemplateApi(key: string, token: string) {
  return apiService({ endpoint: `/api/templates/pptx/${key}`, method: 'DELETE', token });
}

export async function createPptxTemplateApi(data: { id: string; name: string; description: string }, token: string) {
  return apiService({ endpoint: '/api/templates/pptx', method: 'POST', data, token });
}

export async function fetchReportTemplatesApi(token?: string): Promise<ReportTemplateProperties[]> {
  return apiService({ endpoint: '/api/templates/report', token });
}

export async function createReportTemplateApi(data: Record<string, unknown>, token: string) {
  return apiService({ endpoint: '/api/templates/report', method: 'POST', data, token });
}

export async function updateReportTemplateApi(templateId: string, data: Record<string, unknown>, token: string) {
  return apiService({ endpoint: `/api/templates/report`, method: 'PUT', data: { id: templateId, ...data }, token });
}

export async function deleteReportTemplateApi(templateId: string, token: string) {
  return apiService({ endpoint: `/api/templates/report`, method: 'DELETE', data: { id: templateId }, token });
}

export async function fetchPresentationTemplatesApi(token?: string): Promise<PptxTemplateProperties[]> {
  return apiService({ endpoint: '/api/templates/pptx', token });
}

export async function createPresentationTemplateApi(data: Record<string, unknown>, token: string) {
  return apiService({ endpoint: '/api/templates/pptx', method: 'POST', data, token });
}

export async function updatePresentationTemplateApi(templateId: string, data: Record<string, unknown>, token: string) {
  return apiService({ endpoint: `/api/templates/pptx/${templateId}`, method: 'PUT', data, token });
}

export async function deletePresentationTemplateApi(templateId: string, token: string) {
  return apiService({ endpoint: `/api/templates/pptx/${templateId}`, method: 'DELETE', token });
}
