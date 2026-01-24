
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/util/use-toast';
import { featureKeys } from '@/lib/query-keys';
import type { Feature, UpdateFeatureVariables } from '@/lib/types';
import { fetchFeaturesApi, updateFeatureApi } from '@/services/api/featureService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


export function useFeatures() {
    const { data: features, isPending: isLoading, isError, isFetched: isLoaded } = useQuery<Feature[]>({
        queryKey: featureKeys.lists(),
        queryFn: fetchFeaturesApi,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { features: features || [], isLoaded, isLoading, isError };
}

export function useUpdateFeature() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: UpdateFeatureVariables) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return updateFeatureApi(variables, token);
        },
        // Optimistic update
        onMutate: async (newFeatureData) => {
            await queryClient.cancelQueries({ queryKey: featureKeys.lists() });
            const previousFeatures = queryClient.getQueryData<Feature[]>(featureKeys.lists());

            queryClient.setQueryData<Feature[]>(featureKeys.lists(), old =>
                old?.map(feature =>
                    feature.id === newFeatureData.featureId
                        ? { ...feature, ...newFeatureData.payload }
                        : feature
                ) || []
            );

            return { previousFeatures };
        },
        onError: (err: any, variables, context) => {
            if (context?.previousFeatures) {
                queryClient.setQueryData(featureKeys.lists(), context.previousFeatures);
            }
            toast({
                title: "Update Failed",
                description: err.message || "Could not update the feature.",
                variant: "destructive",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        },
    });
}
