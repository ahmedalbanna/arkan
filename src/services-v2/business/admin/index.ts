/**
 * خدمات الإدارة - Services v2.0
 *
 * تصدير جميع خدمات الإدارة المحسنة
 */

// خدمات الإدارة العامة
export { AdminServiceV2, type DashboardStats } from './admin-service';

// خدمات إدارة الوكلاء
export {
    AgentServiceV2,
    type CreateAgentVariables,
    type UpdateAgentVariables,
    type AgentProperties,
    type AgentCategoryDetails,
    type UploadedFile
} from './agent-service';

// خدمات إدارة الميزات
export {
    FeatureServiceV2,
    type Feature,
    type UpdateFeatureVariables
} from './feature-service';

// خدمات إدارة الأقسام
export {
    SectionServiceV2,
    type SectionProperties
} from './section-service';

// خدمات إدارة الإعدادات
export {
    SettingsServiceV2,
    type SystemSettings
} from './settings-service';

// خدمات سجلات التوليد
export {
    GenerationLogServiceV2,
    type GenerationLog,
    type FetchLogsParams,
    type LogsResponse
} from './generation-log-service';