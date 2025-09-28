import { z } from 'zod';
import { createPresentationToolHook } from '../hooks/presentation-tools/use-presentation-factory';

// مخطط التحقق من البيانات
const presentationOutlineSchema = z.object({
    prompt: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
    documentation: z.string().optional(),
});

// القيم الافتراضية
const defaultValues = {
    prompt: '',
    documentation: '',
};

/**
 * Hook محسن لمولد خطط العروض التقديمية
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export const usePresentationOutlineLogic = createPresentationToolHook({
    toolName: 'presentation-outline',
    apiEndpoint: '/api/writing-tools/presentation-outline',
    schema: presentationOutlineSchema,
    defaultValues,
    successMessage: 'Outline generated successfully!',
    errorMessage: 'Failed to generate outline',
    enableFileUpload: false,
    presentationType: 'outline',
    customFeatures: {
        formatOutput: (data: any) => {
            if (data.outline) {
                return {
                    outline: data.outline,
                    cover: data.cover,
                    metadata: {
                        slideCount: data.outline.length,
                        estimatedDuration: data.outline.length * 2, // تقدير دقيقتين لكل شريحة
                        difficulty: data.difficulty || 'medium',
                        targetAudience: data.targetAudience || 'General',
                    }
                };
            }
            return data;
        },
        validateInput: (data: any) => {
            return data.prompt?.length >= 5;
        },
        getPresentationSections: () => [
            'Introduction',
            'Main Content',
            'Examples',
            'Conclusion',
            'Q&A'
        ],
        getSlideCount: (data: any) => {
            return data.outline?.length || 0;
        },
        getEstimatedDuration: (data: any) => {
            return (data.outline?.length || 0) * 2; // دقيقتين لكل شريحة
        }
    }
});
