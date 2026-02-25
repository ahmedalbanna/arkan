
'use client';
import type { AgentProperties } from '@/lib/types';
import { apiService } from './apiService';

export async function fetchAgentsApi(token: string, category?: string): Promise<AgentProperties[]> {
    const url = new URL('/api/agents', window.location.origin);
    if (category) {
        url.searchParams.append('category', category);
    }
    return apiService({ endpoint: url.toString(), token });
}

export async function fetchAgentByIdApi(id: string, token: string): Promise<AgentProperties> {
    return apiService({ endpoint: `/api/agents/${id}`, token });
}

export async function createAgentApi(data: Omit<AgentProperties, 'id'> & { id: string }, token: string): Promise<AgentProperties> {
    return apiService({
      endpoint: '/api/agents',
      method: 'POST',
      data,
      token
    });
}

export async function updateAgentApi(id: string, data: Partial<AgentProperties>, token: string): Promise<AgentProperties> {
    return apiService({
      endpoint: `/api/agents/${id}`,
      method: 'PUT',
      data,
      token
    });
}

export async function deleteAgentApi(id: string, token: string): Promise<{ message: string }> {
    return apiService({
      endpoint: `/api/agents/${id}`,
      method: 'DELETE',
      token
    });
}

export async function fetchAgentCategoriesApi(token: string) {
    return apiService({ endpoint: '/api/agent-categories', token });
}
