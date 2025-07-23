
'use client';

import type { Feature, UpdateFeatureVariables } from '@/lib/types';

/**
 * Fetches the list of all feature flags from the API.
 * @returns A promise that resolves to an array of Feature objects.
 */
export async function fetchFeatures(): Promise<Feature[]> {
    const response = await fetch('/api/features');
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch features');
    }
    return response.json();
}

/**
 * Updates a specific feature flag via the API.
 * @param variables - An object containing the featureId and the payload to update.
 * @param token - The authentication token for the user.
 * @returns A promise that resolves to the updated Feature object.
 */
export async function updateFeature(
    variables: UpdateFeatureVariables,
    token: string
): Promise<Feature> {
    const { featureId, payload } = variables;
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
