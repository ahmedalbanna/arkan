
'use client';

import { useQuery } from '@tanstack/react-query';


import { toast } from '@/hooks/util/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { featureKeys } from '@/lib/query-keys';
import { Feature } from '@/modules/admin/domain/entities/Feature';
import { fetchFeaturesApi, updateFeatureApi, type UpdateFeatureVariables } from '@/modules/admin/adapters/api-client/FeatureApiClient';


export function useFeatures() {
    const { firebaseUser } = useAuth();
    const { data: features, isPending: isLoading, isError, isFetched: isLoaded } = useQuery<Feature[]>({
        queryKey: featureKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error('User not authenticated');
            const token = await firebaseUser.getIdToken();
            return fetchFeaturesApi(token);
        },
        enabled: !!firebaseUser,
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
