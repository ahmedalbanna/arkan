import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/infrastructure/utils/result';

export interface GeneratedReportSectionResponse {
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ProjectChatInput {
  projectContext: string;
  userMessage: string;
  history: ChatMessage[];
}

export interface ProjectChatResponse {
  response: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class ReportApiClient {
  async generateReportSectionApi(body: unknown, signal?: AbortSignal): Promise<Result<GeneratedReportSectionResponse, ApiError>> {
    try {
      const response = await apiService<unknown, GeneratedReportSectionResponse>({
        endpoint: '/api/generate/section',
        method: 'POST',
        data: body,
        signal,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async projectConsultantChat(data: ProjectChatInput): Promise<Result<ProjectChatResponse, ApiError>> {
    try {
      const response = await apiService<ProjectChatInput, ProjectChatResponse>({
        endpoint: '/api/chat/project-consultant',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
