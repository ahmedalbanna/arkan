'use client';

import "reflect-metadata";
import { injectable } from "tsyringe";
import { apiService } from '@/infrastructure/api/ApiService';
import type { Feature } from '@/modules/admin/domain/entities/Feature';

export interface UpdateFeatureVariables {
  featureId: string;
  payload: {
    isEnabled: boolean;
  };
}

@injectable()
export class FeatureApiClient {
  async fetchFeaturesApi(token: string) {
    return apiService<undefined, Feature[]>({
      endpoint: '/api/admin/features',
      token,
    });
  }

  async updateFeatureApi(variables: UpdateFeatureVariables, token: string) {
    const { featureId, payload } = variables;
    return apiService({
      endpoint: `/api/admin/features/${featureId}`,
      method: 'PUT',
      data: payload,
      token,
    });
  }
}
