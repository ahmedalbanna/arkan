/**
 * خدمات المشاريع - Services v2.0
 *
 * تصدير جميع خدمات المشاريع المحسنة
 */

export {
    ProjectServiceV2,
    type CreateProjectData,
    type UpdateProjectData,
    type AddContextData,
    type ProjectSection,
    type SavedProject
} from './project-service';

export {
    ProjectPlanServiceV2,
    type ProjectPlan,
    type GenerateProjectPlanInput,
    type GeneratePlanVariables
} from './project-plan-service';