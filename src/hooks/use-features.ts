
// code explantion in docs/hooks/use-features.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featureKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/AuthContext";
import { handleErrorUtility } from "@/lib/errorUtils";
import {
  fetchFeatures as fetchFeaturesApi,
  updateFeature as updateFeatureApi,
} from "@/services/feature-service";
import { getAuthenticatedToken } from "@/lib/authUtils";
import type { Feature, UpdateFeatureVariables } from "@/lib/types";


/**
 * Custom hook to fetch all feature flags.
 * Caches the data and returns the current state of all features.
 *
 * @returns An object containing the list of features, loading status, and error status.
 */
export function useFeatures() {
  const {
    data: features,
    isLoading,
    isError,
  } = useQuery<Feature[]>({
    queryKey: featureKeys.lists(),
    queryFn: fetchFeaturesApi, // Does not require a token
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) =>
        handleErrorUtility(error, "Failed to fetch features"),
    },
  });

  return { features: features || [], isLoaded: !isLoading, isError };
}

/**
 * Custom mutation hook to update a feature flag.
 * Implements an optimistic update for a seamless UI experience.
 *
 * @returns The result of the useMutation hook.
 */
export function useUpdateFeature() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<Feature, Error, UpdateFeatureVariables, { previousFeatures?: Feature[] }>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateFeatureApi(variables, token);
    },
    // Optimistic update for a better user experience
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: featureKeys.lists() });
      const previousFeatures = queryClient.getQueryData<Feature[]>(
        featureKeys.lists()
      );
      if (previousFeatures) {
        queryClient.setQueryData<Feature[]>(featureKeys.lists(), (old) =>
          old?.map((feature) =>
            feature.id === newData.featureId
              ? { ...feature, ...newData.payload }
              : feature
          )
        );
      }
      return { previousFeatures };
    },
    onError: (err, newData, context) => {
      if (context?.previousFeatures) {
        // Rollback on error
        queryClient.setQueryData(featureKeys.lists(), context.previousFeatures);
      }
      handleErrorUtility(err, "Update Feature Failed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
  });
}
