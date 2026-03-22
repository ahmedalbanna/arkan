'use client';

import { injectable } from "tsyringe";
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import type { Feature } from '@/modules/admin/domain/entities/Feature';
import { Result } from "@/lib/utils/result";

export interface UpdateFeatureVariables {
  featureId: string;
  payload: {
    isEnabled: boolean;
  };
}

@injectable()
export class FeatureApiClient {
  async fetchFeaturesApi(token: string): Promise<Result<Feature[], ApiError>> {
    try {
        const data = await apiService<undefined, Feature[]>({
            endpoint: '/api/admin/features',
            token,
        });
        return Result.ok(data);
    } catch (error: any) {
        return Result.fail(error);
    }
  }

  async updateFeatureApi(variables: UpdateFeatureVariables, token: string): Promise<Result<any, ApiError>> {
    try {
        const { featureId, payload } = variables;
        const data = await apiService({
            endpoint: `/api/admin/features/${featureId}`,
            method: 'PUT',
            data: payload,
            token,
        });
        return Result.ok(data);
    } catch (error: any) {
        return Result.fail(error);
    }
  }
}
