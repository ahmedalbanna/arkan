
'use client';

export interface GenerationLog {
    id: string;
    agentId: string;
    userId: string;
    userName: string; // Add userName
    input: any;
    output: any;
    createdAt: string;
}

interface FetchLogsParams {
    token: string;
    limit: number;
    agentId?: string;
    userId?: string;
    lastVisibleId?: string;
}

export async function fetchGenerationLogs(params: FetchLogsParams): Promise<{ logs: GenerationLog[], hasNextPage: boolean, lastVisibleId: string | null }> {
    const { token, limit, agentId, userId, lastVisibleId } = params;

    if (!token) {
        throw new Error("Authentication token is required.");
    }

    const queryParams = new URLSearchParams({
        limit: limit.toString(),
    });

    if (agentId) queryParams.append('agentId', agentId);
    if (userId) queryParams.append('userId', userId);
    if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);

    const response = await fetch(`/api/admin/logs?${queryParams.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch generation logs');
    }
    return await response.json();
}
