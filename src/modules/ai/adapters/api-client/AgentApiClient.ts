import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { AgentProperties } from '../../domain/entities/Agent';
import { Result } from '@/lib/utils/result';

export interface AgentCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number | null;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class AgentApiClient {
  async fetchAgentsApi(category?: string): Promise<Result<AgentProperties[], ApiError>> {
    try {
      const endpoint = category 
        ? `/api/agents?category=${category}` 
        : '/api/agents';
      const data = await apiService<never, AgentProperties[]>({ endpoint });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchAgentByIdApi(id: string): Promise<Result<AgentProperties, ApiError>> {
    try {
      const data = await apiService<never, AgentProperties>({ endpoint: `/api/agents/${id}` });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async createAgentApi(data: Omit<AgentProperties, 'id'> & { id: string }): Promise<Result<AgentProperties, ApiError>> {
    try {
      const response = await apiService<Omit<AgentProperties, 'id'> & { id: string }, AgentProperties>({
        endpoint: '/api/agents',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateAgentApi(options: { id: string; data: Partial<AgentProperties> }): Promise<Result<AgentProperties, ApiError>> {
    try {
      const response = await apiService<Partial<AgentProperties>, AgentProperties>({
        endpoint: `/api/agents/${options.id}`,
        method: 'PUT',
        data: options.data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteAgentApi(id: string): Promise<Result<{ message: string }, ApiError>> {
    try {
      const response = await apiService<never, { message: string }>({
        endpoint: `/api/agents/${id}`,
        method: 'DELETE',
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchAgentCategoriesApi(): Promise<Result<AgentCategory[], ApiError>> {
    try {
      const data = await apiService<never, AgentCategory[]>({ endpoint: '/api/agent-categories' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
