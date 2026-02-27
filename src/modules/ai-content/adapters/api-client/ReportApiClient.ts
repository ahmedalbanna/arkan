

'use client';

import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";

@injectable()
export class ReportApiClient {
    /**
     * Calls the API to generate a single report section.
     * @param body The request body containing the generation context.
     * @param token The user's authentication token.
     * @returns A promise that resolves to the generated section data.
     */
    async generateReportSectionApi(body: any, token: string): Promise<any> {
        return apiService({
            endpoint: '/api/generate/section',
            method: 'POST',
            data: body,
            token
        });
    }
}
