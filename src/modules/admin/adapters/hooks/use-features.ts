'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { FeatureApiClient, UpdateFeatureVariables } from '@/modules/admin/adapters/api-client/FeatureApiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';
import { featureKeys } from '@/lib/query-keys';

export function useFeatures() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: featureKeys.all(),
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(FeatureApiClient);
      const result = await client.fetchFeaturesApi();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variables: UpdateFeatureVariables) => {
      const client = container.resolve(FeatureApiClient);
      const result = await client.updateFeatureApi(variables);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.all() });
      toast({ title: 'Success', description: 'Feature updated successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update feature.', variant: 'destructive' });
    },
  });
}
