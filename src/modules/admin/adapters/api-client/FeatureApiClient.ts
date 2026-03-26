import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Feature } from '../../domain/entities/Feature';
import { Result } from '@/infrastructure/utils/result';

export interface UpdateFeatureVariables {
  featureId: string;
  payload: Partial<Feature>;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class FeatureApiClient {
  async fetchFeaturesApi(): Promise<Result<Feature[], ApiError>> {
    try {
      const data = await apiService<never, Feature[]>({ endpoint: '/api/features' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateFeatureApi(variables: UpdateFeatureVariables): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<Partial<Feature>, any>({
        endpoint: `/api/features`,
        method: 'PUT',
        data: { id: variables.featureId, ...variables.payload },
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
