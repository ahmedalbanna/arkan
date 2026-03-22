'use client';

import { injectable } from 'tsyringe';
import type { AgentProperties } from '@/lib/types';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

export interface AgentCategory {
  id: string;
  name: string;
  description?: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError('Unexpected agent API error', 500, error);
};

@injectable()
export class AgentApiClient {
  async fetchAgentsApi(token: string, category?: string): Promise<Result<AgentProperties[], ApiError>> {
    try {
      const url = new URL('/api/agents', window.location.origin);
      if (category) {
        url.searchParams.append('category', category);
      }
      const data = await apiService<undefined, AgentProperties[]>({ endpoint: url.toString(), token });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchAgentByIdApi(id: string, token: string): Promise<Result<AgentProperties, ApiError>> {
    try {
      const data = await apiService<undefined, AgentProperties>({ endpoint: `/api/agents/${id}`, token });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createAgentApi(data: Omit<AgentProperties, 'id'> & { id: string }, token: string): Promise<Result<AgentProperties, ApiError>> {
    try {
      const response = await apiService<typeof data, AgentProperties>({
        endpoint: '/api/agents',
        method: 'POST',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateAgentApi(id: string, data: Partial<AgentProperties>, token: string): Promise<Result<AgentProperties, ApiError>> {
    try {
      const response = await apiService<Partial<AgentProperties>, AgentProperties>({
        endpoint: `/api/agents/${id}`,
        method: 'PUT',
        data,
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteAgentApi(id: string, token: string): Promise<Result<{ message: string }, ApiError>> {
    try {
      const response = await apiService<undefined, { message: string }>({
        endpoint: `/api/agents/${id}`,
        method: 'DELETE',
        token,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchAgentCategoriesApi(token: string): Promise<Result<AgentCategory[], ApiError>> {
    try {
      const data = await apiService<undefined, AgentCategory[]>({ endpoint: '/api/agent-categories', token });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
