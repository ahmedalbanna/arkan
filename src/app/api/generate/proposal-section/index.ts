/**
 * فهرس API endpoints لنظام المقترحات الذكية
 */

// تصدير جميع الـ endpoints
export { POST as improveSection } from './improve/route';
export { POST as generateSection } from './route';
export { GET as getStats } from './stats/route';
export { GET as getTemplates } from './templates/route';
export { POST as validateSection } from './validate/route';

// تصدير الأنواع والمخططات
export type {
    ProposalSectionInput,
    ProposalSectionOutput, ProposalSectionType
} from '@/services/intelligent-proposal-service';

