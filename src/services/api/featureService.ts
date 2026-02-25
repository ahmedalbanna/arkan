
'use client';


import { Feature } from '@/modules/admin/domain/entities/Feature';
import { apiService } from './apiService';

/**
 * Fetches the list of all feature flags from the public API.
 * This does not require authentication.
 */
export async function fetchFeaturesApi(): Promise<Feature[]> {
    return apiService({ endpoint: '/api/features' });
}

/**
 * Updates a specific feature flag via the API.
 * Requires admin authentication.
 */
export async function updateFeatureApi(
    variables: UpdateFeatureVariables,
    token: string
): Promise<Feature> {
    const { featureId, payload } = variables;
    return apiService({
      endpoint: `/api/admin/features/${featureId}`,
      method: 'PUT',
      data: payload,
      token
    });
}
