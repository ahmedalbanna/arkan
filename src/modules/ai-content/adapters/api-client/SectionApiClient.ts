import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { SectionProperties } from '../../domain/entities/Section';
import { Result } from '@/lib/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class SectionApiClient {
  async fetchSections(): Promise<Result<SectionProperties[], ApiError>> {
    try {
      const data = await apiService<never, SectionProperties[]>({ endpoint: '/api/admin/sections' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createSection(data: Omit<SectionProperties, 'id'> & { id: string }): Promise<Result<SectionProperties, ApiError>> {
    try {
      const response = await apiService<Omit<SectionProperties, 'id'> & { id: string }, SectionProperties>({
        endpoint: '/api/admin/sections',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateSection(sectionId: string, data: Partial<SectionProperties>): Promise<Result<SectionProperties, ApiError>> {
    try {
      const response = await apiService<Partial<SectionProperties>, SectionProperties>({
        endpoint: `/api/admin/sections/${sectionId}`,
        method: 'PUT',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteSection(sectionId: string): Promise<Result<void, ApiError>> {
    try {
      await apiService({ 
        endpoint: `/api/admin/sections/${sectionId}`,
        method: 'DELETE'
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
