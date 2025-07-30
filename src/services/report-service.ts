
'use client';

import type { GenerateSectionInput, GenerateSectionOutput } from "@/ai/flows/generate-report-section";
import type { ReportGenerationTemplate } from "./template-service";

export async function generateReport(body: any, token: string): Promise<any> {
    const response = await fetch('/api/generate/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report section');
    }
    return await response.json();
}
