
'use client';

import { injectable } from "tsyringe";
import type { AgentProperties } from '@/lib/types';
import { apiService } from '@/infrastructure/api/ApiService';

@injectable()
export class AgentApiClient {
    async fetchAgentsApi(token: string, category?: string): Promise<AgentProperties[]> {
        const url = new URL('/api/agents', window.location.origin);
        if (category) {
            url.searchParams.append('category', category);
        }
        return apiService({ endpoint: url.toString(), token });
    }

    async fetchAgentByIdApi(id: string, token: string): Promise<AgentProperties> {
        return apiService({ endpoint: `/api/agents/${id}`, token });
    }

    async createAgentApi(data: Omit<AgentProperties, 'id'> & { id: string }, token: string): Promise<AgentProperties> {
        return apiService({
            endpoint: '/api/agents',
            method: 'POST',
            data,
            token
        });
    }

    async updateAgentApi(id: string, data: Partial<AgentProperties>, token: string): Promise<AgentProperties> {
        return apiService({
            endpoint: `/api/agents/${id}`,
            method: 'PUT',
            data,
            token
        });
    }

    async deleteAgentApi(id: string, token: string): Promise<{ message: string }> {
        return apiService({
            endpoint: `/api/agents/${id}`,
            method: 'DELETE',
            token
        });
    }

    async fetchAgentCategoriesApi(token: string) {
        return apiService({ endpoint: '/api/agent-categories', token });
    }
}
