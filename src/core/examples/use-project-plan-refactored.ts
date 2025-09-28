import { z } from 'zod';
import { createProjectPlanToolHook } from '../hooks/project-plan-tools/use-project-plan-factory';

// مخطط التحقق من البيانات
const projectPlanSchema = z.object({
    projectTitle: z.string().min(5, 'Project title must be at least 5 characters.'),
    projectDescription: z.string().min(20, 'Project description must be at least 20 characters.'),
    projectType: z.enum(['business', 'technical', 'academic', 'research', 'development']),
    duration: z.number().min(1).max(365), // أيام
    budget: z.number().min(0).optional(),
    teamSize: z.number().min(1).max(50).optional(),
});

// القيم الافتراضية
const defaultValues = {
    projectTitle: '',
    projectDescription: '',
    projectType: 'business' as const,
    duration: 30,
    budget: 0,
    teamSize: 5,
};

/**
 * Hook محسن لمولد خطط المشاريع
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export const useProjectPlanLogic = createProjectPlanToolHook({
    toolName: 'project-plan-generator',
    apiEndpoint: '/api/writing-tools/generate-project-plan',
    schema: projectPlanSchema,
    defaultValues,
    successMessage: 'Project plan generated successfully!',
    errorMessage: 'Failed to generate project plan',
    enableFileUpload: true,
    acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
    planType: 'business',
    customFeatures: {
        formatOutput: (data: any) => {
            if (data.projectPlan) {
                return {
                    projectPlan: data.projectPlan,
                    timeline: data.timeline,
                    resources: data.resources,
                    milestones: data.milestones,
                    metadata: {
                        duration: data.duration || 30,
                        budget: data.budget || 0,
                        teamSize: data.teamSize || 5,
                        complexity: data.complexity || 'medium',
                        riskLevel: data.riskLevel || 'medium',
                    }
                };
            }
            return data;
        },
        validateInput: (data: any) => {
            return data.projectTitle?.length >= 5 &&
                data.projectDescription?.length >= 20 &&
                data.duration >= 1 &&
                data.duration <= 365;
        },
        getPlanSections: () => [
            'Project Overview',
            'Objectives & Goals',
            'Timeline & Milestones',
            'Resource Requirements',
            'Risk Assessment',
            'Budget Planning',
            'Success Metrics'
        ],
        getTimeline: (data: any) => {
            return data.timeline || [];
        },
        getResourceRequirements: (data: any) => {
            return data.resources || [];
        },
        getMilestones: (data: any) => {
            return data.milestones || [];
        }
    }
});
