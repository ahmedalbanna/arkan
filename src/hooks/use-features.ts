
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';

export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

// --- API Service Functions ---

async function fetchFeatures(): Promise<Feature[]> {
    const response = await fetch('/api/features');
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch features');
    }
    return response.json();
}

interface UpdateFeaturePayload {
    isEnabled: boolean;
}

async function updateFeatureApi(
    { featureId, payload }: { featureId: string; payload: UpdateFeaturePayload },
    token: string
) {
    const response = await fetch(`/api/features/${featureId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update feature.');
    }
    return response.json();
}

// --- Custom Hooks ---

export function useFeatures() {
    const { firebaseUser } = useAuth();
    const { data: features, isLoading, isError } = useQuery<Feature[]>({
        queryKey: featureKeys.lists(),
        queryFn: fetchFeatures,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { features: features || [], isLoaded: !isLoading, isError };
}

export function useUpdateFeature() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: { featureId: string; payload: UpdateFeaturePayload }) => {
            const token = await firebaseUser?.getIdToken();
            if (!token) throw new Error("User not authenticated");
            return updateFeatureApi(variables, token);
        },
        onMutate: async (newData) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: featureKeys.lists() });
            const previousFeatures = queryClient.getQueryData<Feature[]>(featureKeys.lists());
            if (previousFeatures) {
                queryClient.setQueryData<Feature[]>(featureKeys.lists(), old =>
                    old?.map(feature =>
                        feature.id === newData.featureId ? { ...feature, ...newData.payload } : feature
                    )
                );
            }
            return { previousFeatures };
        },
        onError: (err, newData, context) => {
            // Rollback on error
            if (context?.previousFeatures) {
                queryClient.setQueryData(featureKeys.lists(), context.previousFeatures);
            }
            handleErrorUtility(err, 'Update Feature Failed');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        }
    });
}
