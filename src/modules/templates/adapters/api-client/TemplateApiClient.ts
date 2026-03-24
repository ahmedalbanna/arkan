import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class TemplateApiClient {
  // --- DOCX Templates ---

  async fetchDocxTemplatesApi(): Promise<Result<any[], ApiError>> {
    try {
      const data = await apiService<never, any[]>({ endpoint: '/api/templates/docx' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchDocxTemplateByIdApi(key: string): Promise<Result<any, ApiError>> {
    try {
      const data = await apiService<never, any>({ endpoint: `/api/templates/docx/${key}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async saveDocxTemplateApi(
    key: string,
    data: any,
  ): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<any, any>({
        endpoint: `/api/templates/docx/${key}`,
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteDocxTemplateApi(key: string): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<never, unknown>({
        endpoint: `/api/templates/docx/${key}`,
        method: 'DELETE',
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  // --- PPTX Templates ---

  async fetchPptxTemplatesApi(): Promise<Result<any[], ApiError>> {
    try {
      const data = await apiService<never, any[]>({ endpoint: '/api/templates/pptx' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchPptxTemplateByIdApi(key: string): Promise<Result<any, ApiError>> {
    try {
      const data = await apiService<never, any>({ endpoint: `/api/templates/pptx/${key}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async savePptxTemplateApi(
    key: string,
    data: any,
  ): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<any, any>({
        endpoint: `/api/templates/pptx/${key}`,
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deletePptxTemplateApi(key: string): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<never, unknown>({
        endpoint: `/api/templates/pptx/${key}`,
        method: 'DELETE',
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  // --- Report Generation Templates ---

  async fetchReportTemplatesApi(): Promise<Result<any[], ApiError>> {
    try {
      const data = await apiService<never, any[]>({ endpoint: '/api/templates/report' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchReportTemplateByIdApi(templateId: string): Promise<Result<any, ApiError>> {
    try {
      const data = await apiService<never, any>({ endpoint: `/api/templates/report/${templateId}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async saveReportTemplateApi(
    templateId: string,
    data: any,
  ): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<any, any>({
        endpoint: `/api/templates/report/${templateId}`,
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteReportTemplateApi(templateId: string): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<never, unknown>({
        endpoint: `/api/templates/report/${templateId}`,
        method: 'DELETE',
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  // --- Presentation Outline Templates ---

  async fetchPresentationTemplatesApi(): Promise<Result<any[], ApiError>> {
    try {
      const data = await apiService<never, any[]>({ endpoint: '/api/templates/presentation' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchPresentationTemplateByIdApi(templateId: string): Promise<Result<any, ApiError>> {
    try {
      const data = await apiService<never, any>({ endpoint: `/api/templates/presentation/${templateId}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async savePresentationTemplateApi(
    templateId: string,
    data: any,
  ): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<any, any>({
        endpoint: `/api/templates/presentation/${templateId}`,
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deletePresentationTemplateApi(templateId: string): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<never, unknown>({
        endpoint: `/api/templates/presentation/${templateId}`,
        method: 'DELETE',
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
