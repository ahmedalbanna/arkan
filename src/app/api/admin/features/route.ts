'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { FirebaseFeatureRepository } from '@/modules/admin/infrastructure/repositories/FirebaseFeatureRepository';
import { GetFeaturesUseCase } from '@/modules/admin/application/use-cases/GetFeaturesUseCase';

export const GET = withAuth(async () => {
  try {
    const repo = new FirebaseFeatureRepository();
    const useCase = new GetFeaturesUseCase(repo);
    const features = await useCase.execute();
    return createApiResponse(features, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
