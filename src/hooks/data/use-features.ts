
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFeaturesAction, updateFeatureAction } from '@/app/actions/featureActions';
import type { Feature } from '@/lib/types';
import { toast } from '@/hooks/util/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { featureKeys } from '@/lib/query-keys';
import type { UpdateFeatureVariables } from '@/lib/types';


export function useFeatures() {
    const { data: features, isPending: isLoading, isError, isFetched: isLoaded } = useQuery<Feature[]>({
        queryKey: featureKeys.lists(),
        queryFn: fetchFeaturesAction,
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
            return updateFeatureAction(variables.featureId, variables.payload);
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
