
'use client';

import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";
import type { GenerateDiagramOutput, ImageToTextOutput } from '@/ai/schemas';

@injectable()
export class DiagramApiClient {
    /**
     * Calls the API to generate a new diagram.
     * @param body The request body containing the proposal, context, and diagram type.
     * @param token The user's authentication token.
     * @returns A promise that resolves to the generated diagram data, including the image URL and explanation.
     */
    async generateDiagramApi(body: any, token: string): Promise<GenerateDiagramOutput & { imageUrl: string }> {
        return apiService({
            endpoint: '/api/generate/diagrams',
            method: 'POST',
            data: body,
            token
        });
    }

    /**
     * Calls the API to update an existing diagram from its PlantUML code.
     * @param plantUmlCode The new PlantUML code for the diagram.
     * @param token The user's authentication token.
     * @returns A promise that resolves to the updated diagram data.
     */
    async updateDiagramApi(plantUmlCode: string, token: string): Promise<{ plantUmlCode: string; imageUrl: string }> {
        return apiService({
            endpoint: '/api/generate/diagrams',
            method: 'POST',
            data: { intent: 'update_diagram', plantUmlCode },
            token
        });
    }

    /**
     * Calls the API to get an explanation for a diagram image.
     * @param body - The request body containing the image data URI and a prompt.
     * @param token - The user's authentication token.
     * @returns A promise that resolves to the explanation text.
     */
    async explainDiagramApi(body: { imageDataUri: string, prompt: string }, token: string): Promise<ImageToTextOutput> {
        return apiService({
            endpoint: '/api/actions/explain-diagram',
            method: 'POST',
            data: body,
            token
        });
    }
}
