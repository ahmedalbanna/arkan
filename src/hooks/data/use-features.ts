'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/util/use-toast';
import { useAuth } from '@/context/AuthContext';
import { featureKeys } from '@/lib/query-keys';
import { Feature } from '@/modules/admin/domain/entities/Feature';
import { FeatureApiClient, type UpdateFeatureVariables } from '@/modules/admin/adapters/api-client/FeatureApiClient';
import { runAuthenticatedResultCall } from './authenticated-client-call';

export function useFeatures() {
  const { firebaseUser } = useAuth();
  const { data: features, isPending: isLoading, isError, isFetched: isLoaded } = useQuery<Feature[]>({
    queryKey: featureKeys.lists(),
    queryFn: async () =>
      runAuthenticatedResultCall(firebaseUser, FeatureApiClient, (client, token) => client.fetchFeaturesApi(token)),
    enabled: Boolean(firebaseUser),
    staleTime: 1000 * 60 * 5,
  });

  return { features: features || [], isLoaded, isLoading, isError };
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: UpdateFeatureVariables) =>
      runAuthenticatedResultCall(firebaseUser, FeatureApiClient, (client, token) =>
        client.updateFeatureApi(variables, token),
      ),
    onMutate: async (newFeatureData) => {
      await queryClient.cancelQueries({ queryKey: featureKeys.lists() });
      const previousFeatures = queryClient.getQueryData<Feature[]>(featureKeys.lists());

      queryClient.setQueryData<Feature[]>(featureKeys.lists(), (old) =>
        old?.map((feature) =>
          feature.id === newFeatureData.featureId
            ? { ...feature, ...newFeatureData.payload }
            : feature,
        ) || [],
      );

      return { previousFeatures };
    },
    onError: (error: unknown, _variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(featureKeys.lists(), context.previousFeatures);
      }

      const description = error instanceof Error ? error.message : 'Could not update the feature.';
      toast({
        title: 'Update Failed',
        description,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
  });
}
