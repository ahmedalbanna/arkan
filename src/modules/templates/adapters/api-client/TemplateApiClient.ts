import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';
import type { DocxTemplateProperties } from '@/modules/templates/domain/entities/DocxTemplate';
import type { PptxTemplateProperties } from '@/modules/templates/domain/entities/PptxTemplate';
import type {
  CreateReportTemplateData,
  ReportTemplateProperties,
  UpdateReportTemplateData,
} from '@/modules/templates/domain/entities/ReportTemplate';
import type { BaseTemplateProperties } from '@/modules/templates/domain/entities/Template';

interface CreateBasicTemplateInput {
  id: string;
  name: string;
  description: string;
}

interface RefreshTemplateImageInput {
  templateId: string;
  prompt: string;
  templateType: 'docx' | 'pptx';
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError('Unexpected template API client error', 500, error);
};

@injectable()
export class TemplateApiClient {
  async fetchDocxTemplatesApi(): Promise<Result<Record<string, DocxTemplateProperties>, ApiError>> {
    try {
      const response = await apiService<undefined, Record<string, DocxTemplateProperties>>({ endpoint: '/api/templates/docx' });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateDocxTemplateApi(
    key: string,
    data: Partial<DocxTemplateProperties>,
    token: string,
  ): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<Partial<DocxTemplateProperties>, unknown>({
        endpoint: `/api/templates/docx/${key}`,
        method: 'PUT',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteDocxTemplateApi(key: string, token: string): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<undefined, unknown>({
        endpoint: `/api/templates/docx/${key}`,
        method: 'DELETE',
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createDocxTemplateApi(
    data: CreateBasicTemplateInput,
    token: string,
  ): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<CreateBasicTemplateInput, unknown>({
        endpoint: '/api/templates/docx',
        method: 'POST',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async refreshTemplateImage(
    data: RefreshTemplateImageInput,
    token: string,
  ): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<RefreshTemplateImageInput, unknown>({
        endpoint: '/api/templates/refresh-image',
        method: 'POST',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchPptxTemplatesApi(): Promise<Result<Record<string, PptxTemplateProperties>, ApiError>> {
    try {
      const response = await apiService<undefined, Record<string, PptxTemplateProperties>>({ endpoint: '/api/templates/pptx' });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updatePptxTemplateApi(
    key: string,
    data: Partial<PptxTemplateProperties>,
    token: string,
  ): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<Partial<PptxTemplateProperties>, unknown>({
        endpoint: `/api/templates/pptx/${key}`,
        method: 'PUT',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deletePptxTemplateApi(key: string, token: string): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<undefined, unknown>({
        endpoint: `/api/templates/pptx/${key}`,
        method: 'DELETE',
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createPptxTemplateApi(
    data: CreateBasicTemplateInput,
    token: string,
  ): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<CreateBasicTemplateInput, unknown>({
        endpoint: '/api/templates/pptx',
        method: 'POST',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchReportTemplatesApi(): Promise<Result<ReportTemplateProperties[], ApiError>> {
    try {
      const response = await apiService<undefined, ReportTemplateProperties[]>({ endpoint: '/api/templates/report' });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createReportTemplateApi(
    data: CreateReportTemplateData,
    token: string,
  ): Promise<Result<ReportTemplateProperties, ApiError>> {
    try {
      const response = await apiService<CreateReportTemplateData, ReportTemplateProperties>({
        endpoint: '/api/templates/report',
        method: 'POST',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateReportTemplateApi(
    templateId: string,
    data: UpdateReportTemplateData,
    token: string,
  ): Promise<Result<ReportTemplateProperties, ApiError>> {
    try {
      const response = await apiService<{ id: string } & UpdateReportTemplateData, ReportTemplateProperties>({
        endpoint: '/api/templates/report',
        method: 'PUT',
        data: { id: templateId, ...data },
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteReportTemplateApi(templateId: string, token: string): Promise<Result<unknown, ApiError>> {
    try {
      const response = await apiService<{ id: string }, unknown>({
        endpoint: '/api/templates/report',
        method: 'DELETE',
        data: { id: templateId },
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchPresentationTemplatesApi(): Promise<Result<PptxTemplateProperties[], ApiError>> {
    const templatesResult = await this.fetchPptxTemplatesApi();

    if (templatesResult.isFailure) {
      return Result.fail(templatesResult.error!);
    }

    return Result.ok(Object.values(templatesResult.getValue()));
  }

  async createPresentationTemplateApi(
    data: BaseTemplateProperties,
    token: string,
  ): Promise<Result<unknown, ApiError>> {
    return this.createPptxTemplateApi(
      {
        id: data.id,
        name: data.name,
        description: data.description,
      },
      token,
    );
  }

  async updatePresentationTemplateApi(
    templateId: string,
    data: Partial<BaseTemplateProperties>,
    token: string,
  ): Promise<Result<unknown, ApiError>> {
    return this.updatePptxTemplateApi(templateId, data as Partial<PptxTemplateProperties>, token);
  }

  async deletePresentationTemplateApi(templateId: string, token: string): Promise<Result<unknown, ApiError>> {
    return this.deletePptxTemplateApi(templateId, token);
  }
}
