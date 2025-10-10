/**
 * خدمة توليد التقارير المحسنة
 *
 * هذا الملف يحتوي على خدمات توليد التقارير وأقسامها مع معالجة أخطاء محسنة
 */

'use client';

import { createDetailedErrorMessage, validateApiResponse } from '@/lib/utils/response-extractor';

/**
 * Calls the API to generate a single report section with enhanced error handling.
 * @param body The request body containing the generation context with new SectionAccordionItem data.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the generated section data.
 */
export async function generateReportSectionApi(body: any, token: string): Promise<any> {
    try {
        console.log('🚀 Starting enhanced report section generation:', {
            sectionToGenerate: body.sectionToGenerate,
            hasStyle: !!body.style,
            hasGuidelines: !!body.guidelines?.length,
            hasOneTimeInstructions: !!body.oneTimeInstructions,
            hasContext: body.hasContext,
            externalContextCount: body.externalContext?.length || 0
        });

        const response = await fetch('/api/generate/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                operationType: 'single-section',
                ...body
            }),
        });

        // التحقق من حالة الاستجابة
        if (!response.ok) {
            let errorMessage = 'Failed to generate report section';
            let errorDetails = '';

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
                errorDetails = errorData.details || '';
            } catch (parseError) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }

            // إنشاء رسالة خطأ مفصلة
            const detailedError = createDetailedErrorMessage(
                new Error(errorMessage),
                body.sectionToGenerate,
                { status: response.status, details: errorDetails }
            );

            throw new Error(detailedError);
        }

        const data = await response.json();
        console.log('✅ API response received:', data);

        // التحقق من صحة البيانات المستلمة
        if (!validateApiResponse(data, body.sectionToGenerate)) {
            throw new Error('Invalid or empty response from server');
        }

        return data;
    } catch (error) {
        console.error('❌ Report generation API error:', error);

        // إعادة رمي الخطأ مع معلومات إضافية
        if (error instanceof Error) {
            throw error;
        }

        // معالجة الأخطاء غير المتوقعة
        const detailedError = createDetailedErrorMessage(
            new Error('Network error occurred'),
            body.sectionToGenerate,
            { originalError: error }
        );

        throw new Error(detailedError);
    }
}
