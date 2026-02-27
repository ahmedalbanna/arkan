
'use client';

import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";
import type { EvaluateReportInput, EvaluateReportOutput } from "@/ai/schemas";

interface EvaluateReportApiVariables {
    body: EvaluateReportInput;
    token: string;
}

@injectable()
export class EvaluationApiClient {
    /**
     * Calls the API to evaluate a generated report against acceptance criteria.
     * @param variables - An object containing the request body and the user's auth token.
     * @returns A promise that resolves to the structured evaluation output.
     */
    async evaluateReportApi(variables: EvaluateReportApiVariables): Promise<EvaluateReportOutput> {
        return apiService({
            endpoint: '/api/evaluate-report',
            method: 'POST',
            data: variables.body,
            token: variables.token
        });
    }
}
