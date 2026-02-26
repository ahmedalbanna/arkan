
'use client';

import "reflect-metadata";
import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";
import type { AnalyzeContextOutput } from '@/ai/schemas';
import { ExternalContext } from '@/modules/ai-content/domain/entities/ExternalContext';

interface AnalyzeContextVariables {
  prompt: string;
  contextFiles: Omit<ExternalContext, 'content' | 'type'> & { type: string, content: string }[];
  token: string;
}

@injectable()
export class RagApiClient {
  async analyzeContextApi(variables: AnalyzeContextVariables): Promise<AnalyzeContextOutput> {
    const { prompt, contextFiles, token } = variables;
    return apiService({
        endpoint: '/api/actions/analyze-context',
        method: 'POST',
        data: { prompt, contextFiles },
        token
    });
  }
}
