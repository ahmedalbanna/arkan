
'use client';

export interface GenerationLog {
    id: string;
    agentId: string;
    userId: string;
    input: any;
    output: any;
    createdAt: string;
}

interface FetchLogsParams {
    token: string;
    page: number;
    limit: number;
    agentId?: string;
    userId?: string;
}

export async function fetchGenerationLogs(params: FetchLogsParams): Promise<{ logs: GenerationLog[], hasNextPage: boolean }> {
    const { token, page, limit, agentId, userId } = params;

    if (!token) {
        throw new Error("Authentication token is required.");
    }

    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (agentId) queryParams.append('agentId', agentId);
    if (userId) queryParams.append('userId', userId);
    
    const response = await fetch(`/api/generations?${queryParams.toString()}`, {
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
