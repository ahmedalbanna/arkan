import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/infrastructure/utils/result';
import { type Template } from '../../domain/repositories/ITemplateRepository';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class TemplateApiClient {
  // --- DOCX Templates ---

  async fetchDocxTemplates(): Promise<Result<Template[], ApiError>> {
    try {
      const data = await apiService<never, Template[]>({ endpoint: '/api/templates/docx' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchDocxTemplateById(id: string): Promise<Result<Template, ApiError>> {
    try {
      const data = await apiService<never, Template>({ endpoint: `/api/templates/docx/${id}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async saveDocxTemplate(
    options: { id: string; data: Partial<Template> }
  ): Promise<Result<Template, ApiError>> {
    try {
      const response = await apiService<Partial<Template>, Template>({
        endpoint: `/api/templates/docx/${options.id}`,
        method: 'POST',
        data: options.data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteDocxTemplate(id: string): Promise<Result<void, ApiError>> {
    try {
      await apiService<never, void>({
        endpoint: `/api/templates/docx/${id}`,
        method: 'DELETE',
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  // --- PPTX Templates ---

  async fetchPptxTemplates(): Promise<Result<Template[], ApiError>> {
    try {
      const data = await apiService<never, Template[]>({ endpoint: '/api/templates/pptx' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchPptxTemplateById(id: string): Promise<Result<Template, ApiError>> {
    try {
      const data = await apiService<never, Template>({ endpoint: `/api/templates/pptx/${id}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async savePptxTemplate(
    options: { id: string; data: Partial<Template> }
  ): Promise<Result<Template, ApiError>> {
    try {
      const response = await apiService<Partial<Template>, Template>({
        endpoint: `/api/templates/pptx/${options.id}`,
        method: 'POST',
        data: options.data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deletePptxTemplate(id: string): Promise<Result<void, ApiError>> {
    try {
      await apiService<never, void>({
        endpoint: `/api/templates/pptx/${id}`,
        method: 'DELETE',
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  // --- Report Generation Templates ---

  async fetchReportTemplates(): Promise<Result<Template[], ApiError>> {
    try {
      const data = await apiService<never, Template[]>({ endpoint: '/api/templates/report' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchReportTemplateById(id: string): Promise<Result<Template, ApiError>> {
    try {
      const data = await apiService<never, Template>({ endpoint: `/api/templates/report/${id}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async saveReportTemplate(
    options: { id: string; data: Partial<Template> }
  ): Promise<Result<Template, ApiError>> {
    try {
      const response = await apiService<Partial<Template>, Template>({
        endpoint: `/api/templates/report/${options.id}`,
        method: 'POST',
        data: options.data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteReportTemplate(id: string): Promise<Result<void, ApiError>> {
    try {
      await apiService<never, void>({
        endpoint: `/api/templates/report/${id}`,
        method: 'DELETE',
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  // --- Presentation Outline Templates ---

  async fetchPresentationTemplates(): Promise<Result<Template[], ApiError>> {
    try {
      const data = await apiService<never, Template[]>({ endpoint: '/api/templates/presentation' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchPresentationTemplateById(id: string): Promise<Result<Template, ApiError>> {
    try {
      const data = await apiService<never, Template>({ endpoint: `/api/templates/presentation/${id}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async savePresentationTemplate(
    options: { id: string; data: Partial<Template> }
  ): Promise<Result<Template, ApiError>> {
    try {
      const response = await apiService<Partial<Template>, Template>({
        endpoint: `/api/templates/presentation/${options.id}`,
        method: 'POST',
        data: options.data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deletePresentationTemplate(id: string): Promise<Result<void, ApiError>> {
    try {
      await apiService<never, void>({
        endpoint: `/api/templates/presentation/${id}`,
        method: 'DELETE',
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
