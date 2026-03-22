'use client';

import { injectable } from 'tsyringe';
import { SectionProperties } from '@/lib/types';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError('Unexpected sections API error', 500, error);
};

@injectable()
export class SectionApiClient {
  async fetchSections(token: string): Promise<Result<SectionProperties[], ApiError>> {
    try {
      const data = await apiService<undefined, SectionProperties[]>({ endpoint: '/api/admin/sections', token });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createSection(data: Omit<SectionProperties, 'id'> & { id: string }, token: string): Promise<Result<SectionProperties, ApiError>> {
    try {
      const response = await apiService<typeof data, SectionProperties>({ endpoint: '/api/admin/sections', method: 'POST', data, token });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateSection(sectionId: string, data: Partial<SectionProperties>, token: string): Promise<Result<SectionProperties, ApiError>> {
    try {
      const response = await apiService<Partial<SectionProperties>, SectionProperties>({ endpoint: `/api/admin/sections/${sectionId}`, method: 'PUT', data, token });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteSection(sectionId: string, token: string): Promise<Result<void, ApiError>> {
    try {
      await apiService<undefined, void>({ endpoint: `/api/admin/sections/${sectionId}`, method: 'DELETE', token });
      return Result.ok(undefined);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
